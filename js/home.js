// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose
const modelURL = 'https://teachablemachine.withgoogle.com/models/dy0IoYYnm/';
// the json file (model topology) has a reference to the bin file (model weights)
const checkpointURL = modelURL + "model.json";
// the metatadata json file contains the text labels of your model and additional information
const metadataURL = modelURL + "metadata.json";

const size = 500;
const flip = true; // whether to flip the webcam
let webcam;
let model;
let totalClasses;
let myCanvas;
let ctx;
let labelContainer;
let numsquats = localStorage.getItem('numsquats');
let squatsleft = numsquats;
let oldClass = 0;
let squatTime = 0;
let poseNet;

// A function that loads the model from the checkpoint
async function load() {
  model = await tmPose.load(checkpointURL, metadataURL);
  totalClasses = model.getTotalClasses();
  labelContainer = document.getElementById('label-container');
  for (let i = 0; i < totalClasses; i++) { // and class labels
      labelContainer.appendChild(document.createElement('div'));
  }
  document.getElementById('squats-left').innerHTML = squatsleft;
  console.log("Number of classes, ", totalClasses);
}

async function loadWebcam() {
  webcam = new tmPose.Webcam(size, size, flip); // can change width and height
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loopWebcam);
}

async function setup() {
  myCanvas = createCanvas(size, size);
  myCanvas.parent("canvas");
  ctx = myCanvas.elt.getContext("2d");
  // Call the load function, wait until it finishes loading
  await load();
  await loadWebcam();
}


async function loopWebcam(timestamp) {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loopWebcam);
}

async function predict() {
    if (squatsleft == 0) {
        celebrate();
    }
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    for (let i = 0; i < totalClasses; i++) {
        const classPrediction = prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;

        if (prediction[i].probability.toFixed(2) >= 0.5) {
            if (oldClass == 1 && i == 1) {
                squatTime = squatTime + 1;
                console.log(i)
            }
            if (squatTime >= 10) {
                squatsleft = (squatsleft >= 0 ? squatsleft - 1 : 0);
                console.log(squatTime, squatsleft);
                squatTime = 0

            }
            if (i != 1) {
                squatTime = 0;
            }
            oldClass = i;
        }
    }

    document.getElementById('squats-left').innerHTML = squatsleft;
    // finally draw the poses
    drawPose(pose);
}

function drawPose(pose) {
  if (webcam.canvas) {
    ctx.drawImage(webcam.canvas, 0, 0);
    // draw the keypoints and skeleton
    if (pose) {
      const minPartConfidence = 0.5;
      tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }
  }
}


function celebrate () {
    party.element(document.getElementById("done"), {
      count: 40,
      countVariation: 0.5,
      angleSpan: 80,
      yVelocity: -300,
      yVelocityVariation: 1,
      rotationVelocityLimit: 6,
      scaleVariation: 0.8
    });
    document.getElementById('done').style = ""
    document.getElementById('party').style.display = "none"
}
