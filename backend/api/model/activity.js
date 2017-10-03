'use strict';
const Bookshelf = require("../service/database").Bookshelf;
const Promise = require('bluebird');
const Exception = require('./exception');
const Upload = require("../service/upload");
const PersonActivity = require("../model/person_activity");
const Status = require("../model/status");
const Base_model = require("./base_model");
const Log = require("../service/log");
const path = require('path');
const Image = require('../service/image');
class Activity extends Base_model {

  get rules() {
    return {
      id: [
        'required', 'integer'
      ],
      headline: [
        'required', 'string'
      ],
      address: [
        'required', 'string'
      ],
      latlon: [
        'required', 'string'
      ],
      description: [
        'required', 'string'
      ],
      status: ['required', 'integer']
    }
  }
  get hidden() {
    return ['password', 'admin']
  }

  get tableName() {
    return 'activity';
  }

  get hasTimestamps() {
    return true;
  }
  get idAttribute() {
    return 'id';
  }

  get hasTimestamps() {
    return true;
  }

  status() {
    return this.belongsTo('status', 'status');
  }

  addPerson(person_id) {
    return PersonActivity.forge({activity_id: this.get("id"), person_id: person_id}).save();
  }

  upload(files) {
    var sampleFile = null,
      width =400,
      height =400,
      newPath = __dirname + "/../../public/upload/";

    if (!files){
      return new Exception.badRequest('No files were uploaded');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    Log.debug(files);
    Object.keys(files).forEach((key)=> {
      Log.debug("Handeling file:", key);
      sampleFile = files[key];
      Image.lwip.open(sampleFile.path,Image.mime[sampleFile.mimetype], (err,image)=>{
        if (err){
          Log.e("Open failed",err);
        }
        image.cover(width, height, (err,image)=>{
          if (err){
            Log.e("Resize failed",err);
          }
          image.writeFile(newPath + sampleFile.filename + '.jpg', "jpg", (err,image)=>{
            if (err){
              Log.e("Write failed",err);
            }
            Log.debug("Sucess writing file:", newPath + sampleFile.filename + '.jpg');
          });
        })
      });
    });
    return true;
  }

  static uploadMiddleWareFactory() {
    var numberOfPhotos = 12;
    return Upload.middleware.array('photos', numberOfPhotos);
  }
  canRead(session) {
    return Promise.resolve(this);;
  }
  canEdit(session) {
    // if (!session.person || !session.person.admin) {
    // 	throw new Exception.notAllowed("Must be an admin")
    // }
    return Promise.resolve(this);;
  }
  canJoin(session) {
    if (!session.person || !session.person.id) {
      throw new Exception.notAllowed("Must be signed in")
    }
    if (!this.status().notActive()) {
      throw new Exception.notAllowed("Activity isn't active");
    }
    return Promise.resolve(this);
  }
  static canCreate(session) {
    if (!session.person || !session.person.id) {
      throw new Exception.notAllowed("Must be signed in")
    }
    return Activity;
  }
};
// private
module.exports = Bookshelf.model('Activity', Activity);
