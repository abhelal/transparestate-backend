const { default: axios } = require("axios");

exports.getWeather = async (req, res) => {
  try {
    const { lat = 52.520008, lon = 13.404954 } = req.params;
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    const opRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const weather = opRes.data;
    res.status(200).json(weather);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
