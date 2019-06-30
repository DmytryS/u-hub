'use strict';

import express from 'express';

export default function frontEndRouter() {
  return new FrontEndRouter();
}
frontEndRouter.$inject = [];

export class FrontEndRouter {
  constructor() {
  }

  frontEnd() {
    const router = express.Router();

    /* GET home page. */
    router.route('/').get((req, res, next) => res.render('index', { title: 'Express' }));

    return router;
  }

}
