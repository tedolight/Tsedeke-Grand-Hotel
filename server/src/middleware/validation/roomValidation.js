import { body } from 'express-validator';

/**
 * Validation rules for room endpoints.
 */

export const createRoomValidation = [
  body('name')
    .notEmpty()
    .withMessage('Room name is required')
    .isLength({ min: 2 })
    .withMessage('Room name must be at least 2 characters'),
  body('type')
    .notEmpty()
    .withMessage('Room type is required')
    .isIn([
      'standard', 'deluxe', 'suite', 'vip', 'single', 'family double bed',
      'deluxe suite', 'deluxe single room', 'deluxe double room', 'deluxe triple room', 'special price room', 'hour room'
    ])
    .withMessage('Invalid room type'),
  body('description')
    .notEmpty()
    .withMessage('Description is required'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isNumeric()
    .withMessage('Price must be a number'),
  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
  body('size')
    .notEmpty()
    .withMessage('Room size is required'),
  body('bed')
    .notEmpty()
    .withMessage('Bed type is required'),
];

export const updateRoomValidation = [
  body('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Room name must be at least 2 characters'),
  body('type')
    .optional()
    .isIn([
      'standard', 'deluxe', 'suite', 'vip', 'single', 'family double bed',
      'deluxe suite', 'deluxe single room', 'deluxe double room', 'deluxe triple room', 'special price room', 'hour room'
    ])
    .withMessage('Invalid room type'),
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
];
