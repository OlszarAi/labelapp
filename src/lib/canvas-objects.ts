/**
 * Canvas Objects
 * Custom object types
 */

import { fabric } from 'fabric';

// Custom object types and factory functions will be defined here

export class QRCodeObject extends fabric.Image {
  // QR Code object implementation will go here
}

export class UUIDObject extends fabric.Text {
  // UUID object implementation will go here
}

// Factory functions for object creation
export const createQRCodeObject = () => {
  // QR code creation logic will go here
};

export const createUUIDObject = () => {
  // UUID creation logic will go here
};
