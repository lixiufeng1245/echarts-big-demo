loader.load('./路2.geojson', function (data) {
    const arr = [];
    for (let i = 0; i < data.features.length; i++) {
        const highway = data.features[i].properties.highway;
        arr.push(highway);
    }
    const arr2 = [...new Set(arr)];
    console.log('highway的属性值种类',arr2);

})

```js
footway:人行道

primary:主干道  这两个什么区别  不知道
trunk：干线公路

residential:住宅旁边路

trunk_link:好像是trunk的环路路线

tertiary：三级公路
secondary：二级公路

    ['primary', 'trunk', 'residential', 'trunk_link', 'tertiary', 'tertiary_link', 'secondary', 'service', 'footway', 'cycleway', null, 'unclassified', 'pedestrian', 'secondary_link', 'construction', 'primary_link', 'path', 'steps', 'living_street', 'platform', 'bus_stop', 'road', 'corridor']

    “主要”，“主干”，“住宅”，“主干线”，“第三”，“第三线”，“第二”，“服务”，“人行道”，“自行车道”，null，“未分类”，“行人”，“第二线”，“施工”，“主要线”，“路径”，“台阶”，“生活街”，“站台”，“公共汽车站”，“道路”，“走廊”
```