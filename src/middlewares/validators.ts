import { body, param, query } from "express-validator";

export const nameValidator = body("name")
    .isString()
    .withMessage("Request have include name parameter")
    .bail()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters long");

export const emailValidator = body("email")
    .isString()
    .withMessage("Request have include email parameter")
    .bail()
    .isEmail()
    .withMessage("Invalid email format");

export const passwordValidator = body("password")
    .isString()
    .withMessage("Request have include password parameter")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain at least one special character");

export const optionalNameValidator = body("name")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be a string between 3 and 50 characters long");

export const optionalEmailValidator = body("email")
    .optional()
    .isString()
    .withMessage("Request have include string email parameter")
    .bail()
    .isEmail()
    .withMessage("Invalid email format");

export const dateOfBirthValidator = body("dateOfBirth")
    .optional()
    .isDate()
    .withMessage("Must be a valid date");

export const bioValidator = body("bio")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Bio must be a string with a maximum length of 500 characters");

export const locationValidator = body("location")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Location must be a string with a maximum length of 100 characters");

export const contentValidator = body("content")
    .isString()
    .withMessage("Request have include content parameter")
    .isLength({ max: 280 })
    .withMessage("Content must be maximum 280 characters long");

export const idValidator = param("id")
    .isString()
    .isLength({ min: 24, max: 24 })
    .withMessage("Should have id in path");

export const userIdQueryValidator = query("userId")
    .optional()
    .isString()
    .isLength({ min: 24, max: 24 })
    .withMessage("Invaild userId in query");

export const bodyIdValidator = (name: string) => body(name)
    .isString()
    .isLength({ min: 24, max: 24 })
    .withMessage(`Request must include ${name}`);