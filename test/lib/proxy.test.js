var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require("sinon-chai"),
    expect = chai.expect,
    Proxy = require('../../lib/proxy'),
    Event = require('events').EventEmitter,
    path = require('path');

chai.use(sinonChai);

describe("roach.test.lib.proxy", function() {

  describe('constructor', function() {

    it('should mixin defaults properly when options are passed', function() {

      // SETUP
      var expected = {
        url: 'http://google.com',
        headers: {
          'User-Agent': 'foo'
        }
      };

      // TEST
      var proxy = new Proxy('http://google.com', { headers: {'User-Agent': 'foo'} });

      // VERIFY
      expect(proxy.options).to.deep.equal(expected);

    });

  });

  describe("isZipFile", function() {

    var proxy;

    before(function() {

      proxy = new Proxy();
    });

    it("should return true when filename contains '.zip'", function(){
      // SETUP
      var filename = 'foo.zip';

      // TEST
      var result = proxy.isZipFile(filename);

      // VERIFY
      expect(result).to.be.true;
    });

    it("should return true when filename contains '.ZIP'", function(){
      // SETUP
      var filename = 'foo.ZIP';

      // TEST
      var result = proxy.isZipFile(filename);

      // VERIFY
      expect(result).to.be.true;
    });

    it("should return false when filename doesn't contain '.zip' or '.ZIP'", function(){
      // SETUP
      var filename = 'foobar';

      // TEST
      var result = proxy.isZipFile(filename);

      // VERIFY
      expect(result).to.be.false;
    });
  });

  describe('isURI', function() {

    var proxy;

    before(function() {

      proxy = new Proxy();
    });

    it('should return true for an http url', function() {

      // TEST
      var result = proxy.isURI('http://google.com');

      // VERIFY
      expect(result).to.be.true;

    });

    it('should return true for an https url', function() {

      // TEST
      var result = proxy.isURI('https://foo.google.io');

      // VERIFY
      expect(result).to.be.true;

    });

    it('should return true for an ftp url', function() {

      // TEST
      var result = proxy.isURI('ftp://user:pass@www.google.com');

      // VERIFY
      expect(result).to.be.true;

    });

    it('should return false for non url string', function() {

      // TEST
      var result = proxy.isURI('/home/users/tmp/');

      // VERIFY
      expect(result).to.be.false;

    });

  });

  describe("fetch", function() {

    it("should call _visit if url is a URI", function(){

      // SETUP
      var proxy = new Proxy('http://google.com');

      var spy = sinon.spy(proxy, '_visit');

      // TEST
      proxy.fetch();

      // VERIFY
      expect(spy).to.have.been.calledOnce;
    });

    it("should call _readFile if url is not a URI", function(){

      // SETUP
      var proxy = new Proxy('package.json');

      var spy = sinon.spy(proxy, '_readFile');

      // TEST
      proxy.fetch();

      // VERIFY
      expect(spy).to.have.been.calledOnce;
    });

  });

  describe("_visit", function() {

    it("should return a single document as a string", function(done){

      // SETUP
      var proxy = new Proxy("http://google.com");

      proxy.on('document', function(document){

        // VERIFY

        expect(document).to.be.a.string;
        done();
      });

      // TEST
      proxy.fetch();
    });

    it("should return an error when status code !== 200", function(done){

      // SETUP
      var proxy = new Proxy("http://google.com/ahfsdhf");

      proxy.on('error', function(error){

        // VERIFY

        expect(error).to.not.be.null;
        done();
      });

      // TEST
      proxy.fetch();
    });

    it("should return an error when the filter finds an error");

  });


  describe("_readFile", function() {

    it("should return a single document as a string when the file exists", function(done){

      // SETUP
      var proxy = new Proxy('package.json');

      proxy.on('document', function(document){

        // VERIFY

        expect(document).to.be.a.string;
        done();
      });

      // TEST
      proxy.fetch();
    });

    it("should return an error when the file doesn't exist", function(done){

      // SETUP
      var proxy = new Proxy("/tmp/foo.txt");

      proxy.on('error', function(error){

        // VERIFY

        expect(error).to.not.be.null;
        done();
      });

      // TEST
      proxy.fetch();
    });

    it("should return a directory path as a string if when directory exists", function(done){
      // SETUP
      var proxy = new Proxy('utils');

      var expected = path.resolve(process.cwd(), 'utils');

      proxy.on('document', function(document){

        // VERIFY

        expect(document).to.equal(expected);
        done();
      });

      // TEST
      proxy.fetch();
    });

  });

});