export default class NotFoundError extends Error {
  statusCode: number;

  constructor(message = 'Ресурс не найден') {
    super(message);
    this.statusCode = 404;
  }
}
