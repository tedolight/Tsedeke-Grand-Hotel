import { body } from 'express-validator';

/**
 * Validation rules for contact endpoints.
 */

export const contactValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Subject must be between 2 and 200 characters'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters'),
];

export const contactReplyValidation = [
  body('message')
    .notEmpty()
    .withMessage('Reply message is required')
    .isLength({ min: 5 })
    .withMessage('Reply must be at least 5 characters'),
];
