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
	activate: function(path) {
		window.location.hash = path;
	},
	isCurrent: function(componentUrl, name, n) {
		var url = this.combine(componentUrl, name);
		var currentUrl = this.current();

		if (n !== undefined) {
			var p = 0;
			while (p >= 0 && n > 0) {
				p = url.indexOf("/", p + 1);
				--n;
			}

			if (p >= 0)
				url = url.substr(0, p);
		}

		return currentUrl.indexOf(url) === 0;
	},
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
		return href;
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
		return <div>{this.props.children}</div>
	}
});

var PathBase = React.createClass({
	getUrl: function() {
		var currentUrl = window.location.hash;
		var ctxUrl = this.context.url;

		return PathUtils.parsePath(
			ctxUrl ? ctxUrl.prevUrl : '/',
			ctxUrl ? ctxUrl.nextUrl : currentUrl,
			this.props.name || '/',
			this.props.forward
		);
	},
	childContextTypes: {
		url: React.PropTypes.object
	},
	getChildContext: function() {
		var url = this.getUrl();
		return {
			url: url ? url : null
		};
	},
	contextTypes: {
		url: React.PropTypes.object
	},
	render: function() {
		var url = this.getUrl();
		if (url) {
			if (this.props.call && _.isFunction(this.props.call)) {
				this.props.call();
			} else {
				if (React.isValidElement(this.props.render)) {
					return this.props.render;
				} else if (this.props.render) {
					var params = $.extend(
						this.props.params || {},
						url.params,
						{ componentUrl: url.prevUrl }
					);
					var el = React.createElement(this.props.render, params);
					return el;
				} else {
					return this.props.children;
				}
			}
		}
		return <Empty/>;
	}
});

var Path = React.createClass({
	propTypes: {
		name: React.PropTypes.string.isRequired
	},
	render: function() {
		return <PathBase name={this.props.name} render={this.props.render} call={this.props.call} params={this.props.params} children={this.props.children} forward={true}/>;
	}
});

var PathEnd = React.createClass({
	propTypes: {
		name: React.PropTypes.string.isRequired
	},
	render: function() {
		return <PathBase name={this.props.name} render={this.props.render} call={this.props.call} params={this.props.params} children={this.props.children} forward={false}/>;
	}
});

function PathInit(reactComponent, params) {
	function updateMainComponent() {
		var currentUrl = PathUtils.fixPath(window.location.hash);
		var loginUrl = params.authenticationUrl && PathUtils.fixPath(params.authenticationUrl);
		if(currentUrl !== loginUrl && params.authenticationFn && !params.authenticationFn())
			PathUtils.activate(params.authenticationUrl);
		else {
			React.render(reactComponent, params.domNode);
		}
	}
	window.onhashchange = updateMainComponent;
	updateMainComponent();
}
