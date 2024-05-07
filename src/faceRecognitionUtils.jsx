import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";

async function extractFeatures(imageSrc) {
	const image = await loadImage(imageSrc);
	const model = await mobilenet.load(); // Carregar MobileNet pré-treinado
	const activation = model.infer(image, true);
	return activation; // Retorna o tensor de características
}

function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.src = src;
		img.onload = () => {
			const tensor = tf.browser
				.fromPixels(img)
				.resizeNearestNeighbor([224, 224]) // Redimensionar a imagem para o tamanho esperado pelo MobileNet
				.toFloat()
				.expandDims();
			resolve(tensor);
		};
		img.onerror = (err) => reject(err);
	});
}
