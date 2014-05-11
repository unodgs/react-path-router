/** @jsx React.DOM */

var About = React.createClass({
	render: function() {
		return (
			<h1>This is a routing demo!</h1>
		);
	}
});


var UserList = React.createClass({
	render: function() {
		var _this = this;

		var users = [
			{id: 1001, username: 'unodgs', password: 'topsecret', firstName: 'Daniel', lastName: 'Kos'},
			{id: 1002, username: 'admin', password: 'admin', firstName: 'Jack', lastName: 'Strong'},
			{id: 1003, username: 'mike', password: 'mike123', firstName: 'Mike', lastName: 'Weak'},
			{id: 1004, username: 'frodo', password: 'ppp222', firstName: 'Michael', lastName: 'Watson'}
		];

		var usersHtml = _.map(users, function(u) {
			return (
				<tr>
					<td>{u.username}</td>
					<td>{u.password}</td>
					<td>{u.firstName}</td>
					<td>{u.lastName}</td>
					<td><A url={_this.props.componentUrl} path={"edit/" + u.id}>Edit</A></td>
				</tr>
			);
		});

		return (
			<table className="table">
				<thead>
					<th>Username</th>
					<th>Password</th>
					<th>First name</th>
					<th>Last name</th>
					<th></th>
				</thead>
				<tbody>
					{usersHtml}
				</tbody>
			</table>
		);
	}
});


var UserEdit = React.createClass({
	render: function() {
		return (
			<Paths>
				<Path url={this.props.url} name="/">
					<form role="form">
						<div className="form-group">
							<label>Username</label>
							<input className="form-control"/>
						</div>
						<div className="form-group">
							<label>Password</label>
							<input type="password" className="form-control"/>
						</div>
						<div className="form-group">
							<label>First name</label>
							<input className="form-control"/>
						</div>
						<div className="form-group">
							<label>Last name</label>
							<input className="form-control"/>
						</div>
						<A className="btn btn-default" url={this.props.componentUrl} path="addfriend">Add friend</A>
					</form>
				</Path>
				<Path url={this.props.url} name="/addfriend">
					<h1>Adding friend form :)</h1>
				</Path>
			</Paths>
		);
	}
});

var UsersModule = React.createClass({
	render: function() {
		return (
			<Paths>
				<Path url={this.props.url} name="/" render={UserList}/>
				<Path url={this.props.url} name="edit/:userId" render={UserEdit}/>
			</Paths>
		);
	}
});

var ClientsModule = React.createClass({
	render: function() {
		return (
			<h1>This is a client list!</h1>
		);
	}
});


var App = React.createClass({
	render: function() {

		var menu = [
			{
				url: 'users',
				name: 'Users'
			},
			{
				url: 'clients',
				name: 'Clients'
			},
			{
				url: 'about',
				name: 'About'
			}
		];

		var _this = this;

		var drawMenu = function(menu) {
			var mm = _.map(menu, function(m) {
				var currentUrl = PathUtils.current();
				var menuUrl = PathUtils.combine(_this.props.parentUrl, m.url);

				return (
					<li className={menuUrl === currentUrl ? "active": ""}>
						<A url={_this.props.componentUrl} path={m.url}>{m.name}</A>
					</li>
				);
			});
			return (
				<nav className="navbar navbar-default navbar-top" role="navigation">
					<ul className="nav navbar-nav">{mm}</ul>
				</nav>
			);
		};

		var menuHtml = drawMenu(menu);

		return (
			<div>
				{menuHtml}
				<div className="container">
					<Path url={this.props.url} name="users" render={UsersModule}/>
					<Path url={this.props.url} name="clients" render={ClientsModule}/>
					<Path url={this.props.url} name="about" render={About}/>
				</div>
			</div>
		);
	}
});

React.renderComponent(<PathInit render={App}/>, document.body);

