$('div#my-treemap').treemap([
{
label: 'Label 1',
value: 50, 
data: 'label 1 data'
},
{
label: 'Label 2',
value: 70, 
data: 'label 2 data'
},
{
label: 'Label 3',
value: 50, 
data: 'label 3 data'
},
{
label: 'Label 4',
value: 30, 
data: 'label 4 data'
},
{
label: 'Label 5',
value: 70, 
data: 'label 5 data'
},
{
label: 'Label 6',
value: 70, 
data: 'label 6 data'
},
], {
nodeClass: function(node, box){
  if(node.value <= 50){
    return 'minor';
  }
  return 'major';
},
mouseenter: function (node, box) {
  $('#data-box').html('<p>Label: ' + node.label + '</p><p>Data:' + node.data + '</p><p>Value:' + node.value + '</p>');
},
itemMargin: 2
});
