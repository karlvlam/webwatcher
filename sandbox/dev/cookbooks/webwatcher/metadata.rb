name              "webwatcher"
maintainer        "Mr.Twister"
maintainer_email  "sardo.ip@sardo.work"
license           "Apache 2.0"
description       "Build webwatcher test environment."
version           "0.0.1"

recipe "webwatcher", "Install node.js from chris-lea's ppa."

%w{ubuntu}.each do |os|
  supports os
end
