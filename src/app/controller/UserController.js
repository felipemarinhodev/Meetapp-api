class UserController {
  async get(req, res) {
    return res.json('User Controller');
  }
}

export default new UserController();
