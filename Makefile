.PHONY: run-gui
 run-gui:
	cd gui && yarn start

.PHONY: run-binary
 run-binary:
	cd binary && yarn start

.PHONY: run-webapps
 run-webapps:
	cd webapps && yarn start

.PHONY: install
install:
	cd gui && yarn install

.PHONY: package
package:
	cd gui && yarn install && yarn package

.PHONY: package-win
package-win:
	cd gui && yarn install && yarn package-win