import { expect } from 'chai';
import request from 'supertest';

import app from '../../icompass';
import Compass from '../../models/compass';

const TOPIC = 'test suite';

describe('Routes', () => {
  let DUT;
  let agent;
  
  before(done => {
    agent = request.agent(app);
    done();
  });

  beforeEach(done => {
    Compass.makeCompass(TOPIC, c => {
      DUT = c;
      done();
    });
  });

  afterEach(done => {
    Compass.remove({ _id: DUT._id }, done);
  });

  it('#getByEdit', (done) => {
    agent
      .get('/api/v1/edit')
      .query({ id: DUT.editCode })
      .end((err, res) => {
        if (err) throw err;
        expect(res.body.compass.editCode).to.equal(DUT.editCode);
        done();
      });
  });
});

