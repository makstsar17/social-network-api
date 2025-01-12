import { body } from 'express-validator'

export const nameValidator = body("name")
    .isString()
    .withMessage("Request have include name parameter")
    .bail()
    .trim()
    .isLength({min: 3, max: 50})
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
    .isLength({min: 8})
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain at least one special character");