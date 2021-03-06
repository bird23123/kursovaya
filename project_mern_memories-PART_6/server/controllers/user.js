import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModal from "../models/user.js";

const secret = 'test';

export const signin = async (req, res) => {
	const { email, password } = req.body;
	try {
		const oldUser = await UserModal.findOne({ email });
		if (!oldUser) return res.status(404).json({ message: "Пользователь не найден" });

		const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);
		if (!isPasswordCorrect) return res.status(400).json({ message: "Неправильные данные" });
		const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, { expiresIn: "1m" });
		res.status(200).json({ result: oldUser, token });
	} catch (err) {
		res.status(500).json({ message: "Что-то пошло не так (ошибка сервера)" });
	}
};

export const signup = async (req, res) => {
	const { email, password, firstName, lastName } = req.body;
	try {
		const oldUser = await UserModal.findOne({ email });
		if (oldUser) return res.status(400).json({ message: "Пользователь уже существует" });

		const hashedPassword = await bcrypt.hash(password, 12);
		const result = await UserModal.create({ email, password: hashedPassword, name: `${firstName} ${lastName}` });
		const token = jwt.sign({ email: result.email, id: result._id }, secret, { expiresIn: "1m" });
		res.status(201).json({ result, token });
	} catch (error) {
		res.status(500).json({message: "Что-то пошло не так (ошибка сервера)"});
		console.log(error);
	}
};
