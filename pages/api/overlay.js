import Cors from "cors";
const cloudinary = require("cloudinary").v2;

cloudinary.config({
	cloud_name: "ddmm5ofs1",
	api_key: process.env.CLD_API_KEY,
	api_secret: process.env.CLD_API_SECRET,
	secure: true,
});

const cors = Cors({
	methods: ["GET", "HEAD", "POST"],
});

function runMiddleware(req, res, fn) {
	return new Promise((resolve, reject) => {
		fn(req, res, (result) => {
			if (result instanceof Error) {
				return reject(result);
			}
			return resolve(result);
		});
	});
}

export default async function handler(req, res) {
	await runMiddleware(req, res, cors);

  const { imageId, overlay } = req.body

	try {
		await cloudinary.uploader.upload(
			overlay, async function (error, uploadedOverlay) {
				const response = await cloudinary.image(`${imageId}.jpg`, {transformation: [
          {overlay: `${uploadedOverlay.public_id}`},
          {flags: "region_relative", width: "1.1", crop: "scale"},
          {flags: "layer_apply", gravity: "adv_faces"}
          ], sign_url: true });

          res.status(200).json(response);
			}
		);		
	} catch (error) {
		res.status(500).json(error);
	}
}

export const config = {
	api: {
		bodyParser: {
			sizeLimit: "5mb",
		},
	},
};
