import { LocalStorage } from 'node-localstorage';

const localStorage = new LocalStorage('./scratch');
const getResponse = async (res: Response) => {
  if (res.ok) return res.json();
  return Promise.reject(new Error(`Ошибка: ${res.status}`));
};

interface IAddCard {
  name: string;
  link: string;
}

interface ISetUserInfo {
  name: string;
  about: string;
}

interface ISetAvatar {
  avatar: string;
}

class Api {
  private _address: string;

  private _token?: string;

  constructor(address: string) {
    this._address = address;
  }

  setToken(token: string) {
    this._token = token;
  }

  getAppInfo() {
    return Promise.all([this.getCardList(), this.getUserInfo()]);
  }

  getCardList() {
    return fetch(`${this._address}/cards`, {
      headers: {
        Authorization: `Bearer ${this._token}`,
      },
    }).then(getResponse);
  }

  addCard({ name, link }: IAddCard) {
    return fetch(`${this._address}/cards`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this._token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, link }),
    }).then(getResponse);
  }

  removeCard(cardId: string) {
    return fetch(`${this._address}/cards/${cardId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this._token}`,
        'Content-Type': 'application/json',
      },
    }).then(getResponse);
  }

  getUserInfo() {
    return fetch(`${this._address}/users/me`, {
      headers: {
        Authorization: `Bearer ${this._token}`,
        'Content-Type': 'application/json',
      },
    }).then(getResponse);
  }

  setUserInfo({ name, about }: ISetUserInfo) {
    return fetch(`${this._address}/users/me`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this._token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, about }),
    }).then(getResponse);
  }

  setUserAvatar({ avatar }: ISetAvatar) {
    return fetch(`${this._address}/users/me/avatar`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this._token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ avatar }),
    }).then(getResponse);
  }

  changeLikeCardStatus(cardId: string, like: boolean) {
    return fetch(`${this._address}/cards/${cardId}/likes`, {
      method: like ? 'PUT' : 'DELETE',
      headers: {
        Authorization: `Bearer ${this._token}`,
        'Content-Type': 'application/json',
      },
    }).then(getResponse);
  }

  register(email: string, password: string) {
    return fetch(`${this._address}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(getResponse);
  }

  login(email: string, password: string) {
    return fetch(`${this._address}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then(getResponse)
      .then((data: { token: string }) => {
        this.setToken(data.token);
        localStorage.setItem('jwt', data.token);
        return data;
      });
  }

  checkToken(token: string) {
    return fetch(`${this._address}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }).then(getResponse);
  }
}

const api = new Api('http://localhost:3000');
export default api;
