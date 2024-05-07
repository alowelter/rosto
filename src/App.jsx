import * as blazeface from "@tensorflow-models/blazeface";
import "@tensorflow/tfjs";
import React, { useEffect, useRef } from "react";

function App() {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);

	useEffect(() => {
		setupCamera();
	}, []);

	const setupCamera = async () => {
		if (navigator.mediaDevices.getUserMedia) {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
			});
			videoRef.current.srcObject = stream;
			videoRef.current.play();
			return new Promise((resolve) => {
				videoRef.current.onloadedmetadata = () => {
					resolve(videoRef.current);
				};
			}).then((video) => {
				loadModel(video);
			});
		}
	};

	const loadModel = async (video) => {
		const model = await blazeface.load();
		console.log("Modelo de detecção de rosto carregado");
		detectFrame(video, model);
	};

	const detectFrame = async (video, model) => {
		const predictions = await model.estimateFaces(video, false);
		renderPredictions(predictions);
		requestAnimationFrame(() => detectFrame(video, model));
	};

	const renderPredictions = (predictions) => {
		const ctx = canvasRef.current.getContext("2d");
		canvasRef.current.width = videoRef.current.videoWidth;
		canvasRef.current.height = videoRef.current.videoHeight;
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.drawImage(
			videoRef.current,
			0,
			0,
			ctx.canvas.width,
			ctx.canvas.height
		);

		predictions.forEach((prediction) => {
			const start = prediction.topLeft;
			const end = prediction.bottomRight;
			const size = [end[0] - start[0], end[1] - start[1]];

			ctx.strokeStyle = "#00FFFF";
			ctx.lineWidth = 2;
			ctx.strokeRect(start[0], start[1], size[0], size[1]);
			ctx.fillStyle = "#00FFFF";
			ctx.fillText(
				"Rosto - " + Math.round(prediction.probability[0] * 100) + "%",
				start[0],
				start[1] - 10
			);
		});
	};

	return (
		<div>
			<video
				ref={videoRef}
				width="720"
				height="560"
				autoPlay
				muted
				style={{ display: "none" }}
			/>
			<canvas ref={canvasRef} style={{ width: "100%" }} />
		</div>
	);
}

export default App;
