//https://towardsdatascience.com/tensorflow-js-using-javascript-web-worker-to-run-ml-predict-function-c280e966bcab

/*
sentiment analysis of restaurant reviews

https://towardsdatascience.com/tensorflow-js-using-javascript-web-worker-to-run-ml-predict-function-c280e966bcab
https://sentiment-tfjs-node.herokuapp.com/
https://sentiment-tfjs-node.herokuapp.com/js/ml/model.json
*/

window.onload = init;

var model = null;

function init() {
  getModel();
}

async function getModel() {
  //console.log(tf);
  model = await tf.loadLayersModel('tensorflow/model.json');
}

function doPrediction(value1, value2, value3) {
  var x_input = tf.tensor([
    [ [value1], [value2], [value3] ]
  ]);
  //console.log('shape:', x_input.shape);
  x_input.print();

  var result = model.predict(x_input);
  //console.log(score = result.dataSync()[0]);
  return result.dataSync()[0];
}
