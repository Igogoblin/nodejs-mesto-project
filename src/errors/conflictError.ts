export default class ConflictError extends Error {
  statusCode: number;

  constructor(message = 'Конфликт данных') {
    super(message);
    this.statusCode = 409;
  }
}
