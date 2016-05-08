all: less bs

bs:
	cp bootstrap/bootstrap.less bower_components/bootstrap/less/bootstrap.less
	cp bootstrap/variables.less bower_components/bootstrap/less/variables.less
	lessc bower_components/bootstrap/less/bootstrap.less bower_components/bootstrap/dist/css/bootstrap.css

less:
	lessc public/css/less/main.less public/css/main.css

open:
	chrome-cli open http://localhost:3000
