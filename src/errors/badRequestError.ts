export default class BadRequestError extends Error {
  statusCode: number;

  constructor(message = 'Некорректные данные') {
    super(message);
    this.statusCode = 400;
  }
}
