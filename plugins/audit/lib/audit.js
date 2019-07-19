"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _request = _interopRequireDefault(require("request"));

var _express = _interopRequireDefault(require("express"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class ProxyAudit {
  constructor(config, options) {
    _defineProperty(this, "enabled", void 0);

    _defineProperty(this, "logger", void 0);

    this.enabled = config.enabled || false;
    this.logger = options.logger;
  }

  register_middlewares(app, auth, storage) {
    const fetchAudit = (req, res) => {
      const headers = req.headers;
      headers.host = 'https://registry.npmjs.org/';
      const requestOptions = {
        url: 'https://registry.npmjs.org/-/npm/v1/security/audits',
        method: req.method,
        proxy: auth.config.https_proxy,
        req,
        strictSSL: true
      };
      req.pipe((0, _request.default)(requestOptions)).on('error', err => {
        if (typeof res.report_error === 'function') {
          return res.report_error(err);
        }

        this.logger.error(err);
        return res.status(500).end();
      }).pipe(res);
    };

    const handleAudit = (req, res) => {
      if (this.enabled) {
        fetchAudit(req, res);
      } else {
        res.status(500).end();
      }
    };
    /* eslint new-cap:off */


    const router = _express.default.Router();
    /* eslint new-cap:off */


    router.post('/audits', handleAudit);
    router.post('/audits/quick', handleAudit);
    app.use('/-/npm/v1/security', router);
  }

}

exports.default = ProxyAudit;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hdWRpdC50cyJdLCJuYW1lcyI6WyJQcm94eUF1ZGl0IiwiY29uc3RydWN0b3IiLCJjb25maWciLCJvcHRpb25zIiwiZW5hYmxlZCIsImxvZ2dlciIsInJlZ2lzdGVyX21pZGRsZXdhcmVzIiwiYXBwIiwiYXV0aCIsInN0b3JhZ2UiLCJmZXRjaEF1ZGl0IiwicmVxIiwicmVzIiwiaGVhZGVycyIsImhvc3QiLCJyZXF1ZXN0T3B0aW9ucyIsInVybCIsIm1ldGhvZCIsInByb3h5IiwiaHR0cHNfcHJveHkiLCJzdHJpY3RTU0wiLCJwaXBlIiwib24iLCJlcnIiLCJyZXBvcnRfZXJyb3IiLCJlcnJvciIsInN0YXR1cyIsImVuZCIsImhhbmRsZUF1ZGl0Iiwicm91dGVyIiwiZXhwcmVzcyIsIlJvdXRlciIsInBvc3QiLCJ1c2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7Ozs7O0FBS2UsTUFBTUEsVUFBTixDQUEyRDtBQUl4RUMsRUFBQUEsV0FBVyxDQUFDQyxNQUFELEVBQXNCQyxPQUF0QixFQUEyRDtBQUFBOztBQUFBOztBQUNwRSxTQUFLQyxPQUFMLEdBQWVGLE1BQU0sQ0FBQ0UsT0FBUCxJQUFrQixLQUFqQztBQUNBLFNBQUtDLE1BQUwsR0FBY0YsT0FBTyxDQUFDRSxNQUF0QjtBQUNEOztBQUVEQyxFQUFBQSxvQkFBb0IsQ0FBQ0MsR0FBRCxFQUFXQyxJQUFYLEVBQTBDQyxPQUExQyxFQUFpRjtBQUNuRyxVQUFNQyxVQUFVLEdBQUcsQ0FBQ0MsR0FBRCxFQUFlQyxHQUFmLEtBQStEO0FBQ2hGLFlBQU1DLE9BQU8sR0FBR0YsR0FBRyxDQUFDRSxPQUFwQjtBQUNBQSxNQUFBQSxPQUFPLENBQUNDLElBQVIsR0FBZSw2QkFBZjtBQUVBLFlBQU1DLGNBQWMsR0FBRztBQUNyQkMsUUFBQUEsR0FBRyxFQUFFLHFEQURnQjtBQUVyQkMsUUFBQUEsTUFBTSxFQUFFTixHQUFHLENBQUNNLE1BRlM7QUFHckJDLFFBQUFBLEtBQUssRUFBRVYsSUFBSSxDQUFDTixNQUFMLENBQVlpQixXQUhFO0FBSXJCUixRQUFBQSxHQUpxQjtBQUtyQlMsUUFBQUEsU0FBUyxFQUFFO0FBTFUsT0FBdkI7QUFRQVQsTUFBQUEsR0FBRyxDQUNBVSxJQURILENBQ1Esc0JBQVFOLGNBQVIsQ0FEUixFQUVHTyxFQUZILENBRU0sT0FGTixFQUVlQyxHQUFHLElBQUk7QUFDbEIsWUFBSSxPQUFPWCxHQUFHLENBQUNZLFlBQVgsS0FBNEIsVUFBaEMsRUFBNEM7QUFDMUMsaUJBQU9aLEdBQUcsQ0FBQ1ksWUFBSixDQUFpQkQsR0FBakIsQ0FBUDtBQUNEOztBQUNELGFBQUtsQixNQUFMLENBQVlvQixLQUFaLENBQWtCRixHQUFsQjtBQUNBLGVBQU9YLEdBQUcsQ0FBQ2MsTUFBSixDQUFXLEdBQVgsRUFBZ0JDLEdBQWhCLEVBQVA7QUFDRCxPQVJILEVBU0dOLElBVEgsQ0FTUVQsR0FUUjtBQVVELEtBdEJEOztBQXdCQSxVQUFNZ0IsV0FBVyxHQUFHLENBQUNqQixHQUFELEVBQWVDLEdBQWYsS0FBaUM7QUFDbkQsVUFBSSxLQUFLUixPQUFULEVBQWtCO0FBQ2hCTSxRQUFBQSxVQUFVLENBQUNDLEdBQUQsRUFBTUMsR0FBTixDQUFWO0FBQ0QsT0FGRCxNQUVPO0FBQ0xBLFFBQUFBLEdBQUcsQ0FBQ2MsTUFBSixDQUFXLEdBQVgsRUFBZ0JDLEdBQWhCO0FBQ0Q7QUFDRixLQU5EO0FBUUE7OztBQUNBLFVBQU1FLE1BQU0sR0FBR0MsaUJBQVFDLE1BQVIsRUFBZjtBQUNBOzs7QUFDQUYsSUFBQUEsTUFBTSxDQUFDRyxJQUFQLENBQVksU0FBWixFQUF1QkosV0FBdkI7QUFFQUMsSUFBQUEsTUFBTSxDQUFDRyxJQUFQLENBQVksZUFBWixFQUE2QkosV0FBN0I7QUFFQXJCLElBQUFBLEdBQUcsQ0FBQzBCLEdBQUosQ0FBUSxvQkFBUixFQUE4QkosTUFBOUI7QUFDRDs7QUFsRHVFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHJlcXVlc3QgZnJvbSAncmVxdWVzdCc7XG5pbXBvcnQgZXhwcmVzcywgeyBSZXF1ZXN0LCBSZXNwb25zZSB9IGZyb20gJ2V4cHJlc3MnO1xuXG5pbXBvcnQgeyBMb2dnZXIsIElQbHVnaW5NaWRkbGV3YXJlLCBJQmFzaWNBdXRoLCBJU3RvcmFnZU1hbmFnZXIsIFBsdWdpbk9wdGlvbnMgfSBmcm9tICdAdmVyZGFjY2lvL3R5cGVzJztcbmltcG9ydCB7IENvbmZpZ0F1ZGl0IH0gZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb3h5QXVkaXQgaW1wbGVtZW50cyBJUGx1Z2luTWlkZGxld2FyZTxDb25maWdBdWRpdD4ge1xuICBlbmFibGVkOiBib29sZWFuO1xuICBsb2dnZXI6IExvZ2dlcjtcblxuICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbmZpZ0F1ZGl0LCBvcHRpb25zOiBQbHVnaW5PcHRpb25zPENvbmZpZ0F1ZGl0Pikge1xuICAgIHRoaXMuZW5hYmxlZCA9IGNvbmZpZy5lbmFibGVkIHx8IGZhbHNlO1xuICAgIHRoaXMubG9nZ2VyID0gb3B0aW9ucy5sb2dnZXI7XG4gIH1cblxuICByZWdpc3Rlcl9taWRkbGV3YXJlcyhhcHA6IGFueSwgYXV0aDogSUJhc2ljQXV0aDxDb25maWdBdWRpdD4sIHN0b3JhZ2U6IElTdG9yYWdlTWFuYWdlcjxDb25maWdBdWRpdD4pIHtcbiAgICBjb25zdCBmZXRjaEF1ZGl0ID0gKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSAmIHsgcmVwb3J0X2Vycm9yPzogRnVuY3Rpb24gfSkgPT4ge1xuICAgICAgY29uc3QgaGVhZGVycyA9IHJlcS5oZWFkZXJzO1xuICAgICAgaGVhZGVycy5ob3N0ID0gJ2h0dHBzOi8vcmVnaXN0cnkubnBtanMub3JnLyc7XG5cbiAgICAgIGNvbnN0IHJlcXVlc3RPcHRpb25zID0ge1xuICAgICAgICB1cmw6ICdodHRwczovL3JlZ2lzdHJ5Lm5wbWpzLm9yZy8tL25wbS92MS9zZWN1cml0eS9hdWRpdHMnLFxuICAgICAgICBtZXRob2Q6IHJlcS5tZXRob2QsXG4gICAgICAgIHByb3h5OiBhdXRoLmNvbmZpZy5odHRwc19wcm94eSxcbiAgICAgICAgcmVxLFxuICAgICAgICBzdHJpY3RTU0w6IHRydWVcbiAgICAgIH07XG5cbiAgICAgIHJlcVxuICAgICAgICAucGlwZShyZXF1ZXN0KHJlcXVlc3RPcHRpb25zKSlcbiAgICAgICAgLm9uKCdlcnJvcicsIGVyciA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiByZXMucmVwb3J0X2Vycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLnJlcG9ydF9lcnJvcihlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcihlcnIpO1xuICAgICAgICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuZW5kKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5waXBlKHJlcyk7XG4gICAgfTtcblxuICAgIGNvbnN0IGhhbmRsZUF1ZGl0ID0gKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkgPT4ge1xuICAgICAgaWYgKHRoaXMuZW5hYmxlZCkge1xuICAgICAgICBmZXRjaEF1ZGl0KHJlcSwgcmVzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcy5zdGF0dXMoNTAwKS5lbmQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyogZXNsaW50IG5ldy1jYXA6b2ZmICovXG4gICAgY29uc3Qgcm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcbiAgICAvKiBlc2xpbnQgbmV3LWNhcDpvZmYgKi9cbiAgICByb3V0ZXIucG9zdCgnL2F1ZGl0cycsIGhhbmRsZUF1ZGl0KTtcblxuICAgIHJvdXRlci5wb3N0KCcvYXVkaXRzL3F1aWNrJywgaGFuZGxlQXVkaXQpO1xuXG4gICAgYXBwLnVzZSgnLy0vbnBtL3YxL3NlY3VyaXR5Jywgcm91dGVyKTtcbiAgfVxufVxuIl19