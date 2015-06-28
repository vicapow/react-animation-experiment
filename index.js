'use strict';
/*eslint-disable no-console*/
var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var window = require('global/window');
var mapObj = require('map-obj');
var filterObj = require('filter-object');
var console = window.console;
var document = require('global/document');
var r = require('r-dom');
var alphaify = require('alphaify');
var assign = require('object-assign');
var transform = require('svg-transform');
var d3 = require('d3');

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

var App = React.createClass({
  displayName: 'App',
  getInitialState: function getInitialState() {
    var timeWall = Date.now();
    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      points: d3.range(500).map(function _map(p) {
        return {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight
        };
      }),
      animation: {
        time: 0,
        timeStep: 0,
        timeWall: timeWall,
        timeWallPrevious: timeWall,
        timeWallDelta: 0,
        transitions: {
          circle: {
            start: 0,
            ease: 'bounce',
            end: 2000,
            props: {r: 4},
            changes: {r: [4, 20]}
          }
        }
      }
    };
  },
  _animationLoop: function _animationLoop() {
    var timeWall = Date.now();
    var animation = this.state.animation;
    var timeWallDelta = timeWall - animation.timeWallPrevious;
    var time = animation.time + timeWallDelta;
    var changes = {
      animation: {
        time: time,
        timeStep: timeWallDelta,
        timeWall: timeWall,
        timeWallPrevious: animation.timeWall,
        timeWallDelta: timeWallDelta,
        transitions: {}
      }
    };
    var transitionNames = Object.keys(animation.transitions);
    transitionNames.forEach(function _forEach(name) {
      var t = animation.transitions[name];
      var progress = clamp((time - t.start) / (t.end - t.start), 0, 1);
      changes.animation.transitions[name] = {
        start: t.start,
        end: t.end,
        ease: t.ease,
        props: mapObj(t.props, function _mapObj(prop, value, object) {
          var propChanges = t.changes[prop];
          var easeProgress = d3.ease(t.ease || 'cubic')(progress);
          value = d3.interpolate(propChanges[0], propChanges[1])(easeProgress);
          return [prop, value];
        }),
        changes: t.changes
      };
    });
    this.setState(changes);
    window.requestAnimationFrame(this._animationLoop);
  },

  componentDidMount: function componentDidMount() {
    window.requestAnimationFrame(this._animationLoop);
    window.addEventListener('resize', function _resize() {
      this.setState({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight
      });
    }.bind(this));
  },

  _onClickCircle: function _onClickCircle() {
    var circle = this.state.animation.transitions.circle;
    var state = assign({}, this.state);
    circle.start = state.animation.time;
    circle.end = circle.start + 2000;
    if (circle.changes.r[1] === 20) {
      // opening
      circle.changes = {r: [circle.props.r, 4]};
    } else {
      circle.changes = {r: [circle.props.r, 20]};
    }
    this.setState(state);
  },

  render: function render() {
    var visibleState = filterObj(this.state, '!points');
    visibleState.points = '[points not show]';
    return r.div({
      style: {
        width: this.state.windowWidth,
        height: this.state.windowHeight,
        position: 'absolute',
        boxSizing: 'border-box',
        background: 'rgba(0, 0, 0, 0.1)'
      }
    }, [
      r.svg({
        style: {
          width: this.state.windowWidth,
          height: this.state.windowHeight,
          position: 'absolute',
          top: 0,
          left: 0
        }
      }, [
        r.g({
          transform: transform([{translate: [0, 0]}])
        }, this.state.points.map(function _map(point, index) {
          return r.circle(
            assign({}, this.state.animation.transitions.circle.props, {
              onClick: this._onClickCircle,
              cx: this.state.points[index].x,
              cy: this.state.points[index].y,
              style: {
                cursor: 'pointer',
                fill: alphaify('steelblue', 0.5)
              }
            })
          );
        }, this))
      ]),
      r.code({}, r.pre(JSON.stringify(visibleState, null, 2)))
    ]);
  }
});

document.body.style.margin = 0;

React.render(r(App), document.body);
