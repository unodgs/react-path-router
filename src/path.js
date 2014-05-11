/** @jsx React.DOM */
var Empty = React.createClass({
	render: function() {
		return <div>{this.props.children}</div>;
	}
});

var A = React.createClass({
	render: function() {
		var href = PathUtils.combine(this.props.url, this.props.path);
		return <a href={'#' + href}>{this.props.children}</a>
	}
});

var PathUtils = {
	current: function() {
		return window.location.hash.substr(1);
	},
	combine: function(url, path) {
		var url = url || '';
		var path = path || '';

		url = url.trim();
		path = path.trim();

		if (path === '')
			return '';

		var href = '';

		if (url.length > 0) {
			if (url[0] !== '/')
				href += '/';
			if (url[url.length - 1] === '/')
				url = url.substr(0, url.length - 1);

			href += url;
		}

		if (path.length > 0) {
			if (path[0] !== '/')
				href += '/';
			if (path[path.length - 1] === '/')
				path = path.substr(0, path.length - 1);

			href += path;
		}

		return href
	},
	fixPath: function(path) {
		path = path.trim();
		var s = 0;
		var e = 0;
		if (path.length > 0) {
			if (path[0] == '#' || path[0] == '/')
				++s;
			if (path.length > 1 && path[1] == '/')
				++s;
			if (path[path.length - 1] == '/')
				++e;
			path = path.substr(s, path.length - s - e);
		}
		return path;
	},
	hasHash: function(path) {
		path = path.trim();
		return path.length > 0 && path[0] === '#';
	},
	parsePath: function(prevPath, path, name, forward) {
		var isHash = this.hasHash(path);

		path = this.fixPath(path);
		name = this.fixPath(name);

		var params = {};
		var accepted = (path === '' || isHash) && name === '';

		var nextUrl = accepted ? '/' + path : '';
		var prevUrl = accepted ? '/' : '';

		if (!accepted && path !== '' && name !== '') {
			var vp = path.split('/');
			var vn = name.split('/');

			if (!forward && vn.length != vp.length) {
				accepted = false;
			} else {
				accepted = true;
				for (var i = 0; i < Math.min(vn.length, vp.length); i++) {
					var p = vp[i];
					var n = vn[i];
					var isParam = n[0] === ':';

					if (!isParam && n !== p) {
						accepted = false;
						break;
					}

					if (isParam)
						params[n.substr(1)] = p;

					if (nextUrl !== '')
						nextUrl += '/';

					nextUrl += p;

					if (prevUrl !== '')
						prevUrl += '/';

					prevUrl += p;
				}

				nextUrl = path.substr(nextUrl.length);
				if (nextUrl === '')
					nextUrl = '/';

				if (prevUrl === '')
					prevUrl = '/';
			}
		}

		return accepted
			? { prevUrl: PathUtils.combine(prevPath, prevUrl), nextUrl: nextUrl, params: params }
			: false;
	}
};

var Paths = React.createClass({
	render: function() {
		return <div>{this.props.children}</div>;
	}
});

var PathBase = React.createClass({
	render: function() {
		var currentUrl = window.location.hash;

		var url = PathUtils.parsePath(
			this.props.url ? this.props.url.prevUrl : '/',
			this.props.url ? this.props.url.nextUrl : currentUrl,
			this.props.name || '/',
			this.props.forward
		);

		if (url) {
			var params = {
				url: { prevUrl: url.prevUrl, nextUrl: url.nextUrl },
				componentUrl: url.prevUrl
			};
			params = $.extend(params, url.params);

			return this.props.render
				? this.props.render(params)
				: <div>{this.props.children}</div>;
		}

		return <Empty/>;
	}
});

var Path = React.createClass({
	propTypes: {
		url: React.PropTypes.object,
		name: React.PropTypes.string.isRequired
	},
	render: function() {
		return <PathBase url={this.props.url} name={this.props.name} render={this.props.render} forward={true} children={this.props.children}/>;
	}
});

var PathEnd = React.createClass({
	propTypes: {
		url: React.PropTypes.object,
		name: React.PropTypes.string.isRequired
	},
	render: function() {
		return <PathBase url={this.props.url} name={this.props.name} render={this.props.render} forward={false} children={this.props.children}/>;
	}
});

var PathInit = React.createClass({
	propTypes: {
		render: React.PropTypes.func.isRequired,
		domNode: React.PropTypes.object
	},
	main: function() {
		React.renderComponent(this, this.props.domNode || document.body);
	},
	componentDidMount: function() {
		window.onhashchange = this.main;
	},
	render: function() {
		return <PathBase url={this.props.url} name="/" render={this.props.render} forward={true} children={this.props.children}/>;
	}
});
