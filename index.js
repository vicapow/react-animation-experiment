'use strict';

var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var window = require('global/window');
var document = require('global/document');
var r = require('r-dom');
var assign = require('object-assign');
var transform = require('svg-transform');
var d3 = require('d3');

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
console.log('PureRenderMixin', PureRenderMixin.shouldComponentUpdate.toString());
var SVGCircleButton = React.createClass({
  displayName: 'SVGCircleButton',
  getInitialState: function getInitialState() {
    return {};
  },
  mixins: [PureRenderMixin],
  render: function render() {
    console.log('render svg circle!');
    var t = this.props.amountOpen;
    return r.circle({
      onClick: this.props.onClick,
      style: {
        fill: 'rgba(255, 0, 0, ' + d3.interpolateNumber(0.2, 0.6)(t) + ')',
        cursor: 'pointer'
      },
      transform: transform([{translate: [0, 0]}]),
      r: d3.interpolateNumber(10, 100)(t)
    });
  }
});

var App = React.createClass({
  displayName: 'App',
  getInitialState: function getInitialState() {
    var t = Date.now();
    return {
      t: t,
      dt: 0,
      pt: t,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      button: {amountOpen: 0, transitionStart: t, transitionDuration: 2000}
    };
  },
  _animationLoop: function _animationLoop() {
    var t = Date.now();
    var stateChanges = {
      t: t,
      pt: this.state.t,
      dt: t - this.state.t
    };
    stateChanges.button = (function() {
      var t = (this.state.t - this.state.button.transitionStart) /
        this.state.button.transitionDuration;
      if (!this.state.button.isOpening) {
        t = 1 - t;
      }
      return assign({}, this.state.button, {amountOpen: clamp(t, 0, 1)});
    }.bind(this)());
    this.setState(stateChanges);
    window.requestAnimationFrame(this._animationLoop);
  },

  componentDidMount: function componentDidMount() {
    window.requestAnimationFrame(this._animationLoop);
    window.addEventListener('resize', function() {
      this.setState({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight
      });
    }.bind(this));
  },

  _onClickCircle: function _onClickCircle() {
    this.setState({
      button: assign(this.state.button, {
        isOpening: !this.state.button.isOpening,
        transitionStart: this.state.t
      })
    });
  },

  render: function render() {
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
        r.g({transform: transform([{translate: [500, 100]}])}, [
          r(SVGCircleButton, {
            amountOpen: this.state.button.amountOpen,
            onClick: this._onClickCircle
          })
        ])
      ]),
      r.code({}, r.pre(JSON.stringify(this.state, null, 2)))
    ]);
  }
});

document.body.style.margin = 0;

React.render(r(App), document.body);
