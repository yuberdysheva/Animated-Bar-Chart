/* Как подключать файлы с download в Бункере: https://st.yandex-team.ru/TRAFFIC-3431#1493064059000
   Пример ссылки: 'https://download.cdn.yandex.net/company/figures/2017/confrontation/project/i/russia.svg' */
var days = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

$(window).on('load', function () {
    main();
});

function main () {
    $('.preloader').remove();
    d3.tsv('data/categories-data.tsv', function (categoriesData) {
        var dataSetInit = [];
        /*function createMegaData(src, name) {
            return src.map(function(x, i) {
                var obj = {};
                obj["day"] = days[i];
                obj["value"] = parseFloat(x[name]);
                return obj;
            });
        }*/

        //создаем выпадающее меню
        var categoriesArr = Object.keys(categoriesData[0]);
        categoriesArr.forEach(function (category) {
            var option = $('<option>').attr('value', category).text(category);
            $('#categories').append(option);
        });

        categoriesData.forEach(function (d) {
            categoriesArr.forEach(function (category) {
                d[category] = parseFloat(d[category]);
            });
            dataSetInit.push(d['АЗС']);
        });

        //вешаем событие на выбор категории из выпадающего меню
        var select = d3.select('select')
            .on('change', selectDataSet);
        function selectDataSet() {
            var value = this.value;
            var dataSet = [];
            categoriesData.forEach(function (d) {
                dataSet.push(d[[value]]);
                //dataSetInit.push(d['АЗС']);
            });
            change(dataSet);
        }

        //описываем размеры svg
        var margin = {top: 30, right: 0, bottom: 40, left: 40};
        var width = 600 - margin.left - margin.right;
        var height = 440 - margin.top - margin.bottom;
        var formatPercent = d3.format("");

        //объявляем оси
        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .7, 1);
        var y = d3.scale.linear()
            .range([height, 0]);
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .tickFormat(formatPercent);

        x.domain(days.map(function (d) {return d; }));


        //добавляем svg
        var svg = d3.select('#content').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var xLine = svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        xLine.append('line')
            .attr('class', 'line-bottom')
            .attr('x1', 9)
            .attr('x2', width )
            .attr('y1', 1)
            .attr('y2', 1);

        change(dataSetInit);

        function change(dataset) {


            y.domain([0, d3.max(dataset, function (d) { return d*100 })]);
            svg.select('.y.axis').remove();

            svg.append('g')
                .attr('class', 'y axis')
                .call(yAxis)
                .append('text')
                .attr('y', -5)
                .attr('x', 10)
                .text('Доля от всех запросов за неделю, %');

            var bar = svg.selectAll('.bar')
                .data(dataset, function (d, i) {
                    return i;
                });
            //new data
            bar.enter().append('rect')
                .attr('class', 'bar')
                .attr('x', function (d, i) { return x(days[i]); })
                .attr('y', function (d) { return y(d * 100); })
                .attr('height', function (d) {return height - y(d * 100); })
                .attr('width', x.rangeBand());

            //remove data
            /*bar.exit().remove();*/

            //update data
            bar
                .transition()
                .duration(750)
                .attr("y", function(d) { return y(d*100); })
                .attr("height", function(d) { return height - y(d*100); });

        }
    });
}