if ! hash flyway 2>/dev/null; then
  pushd ~/
  wget -qO- https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/9.4.0/flyway-commandline-9.4.0-linux-x64.tar.gz | tar xvz && sudo ln -s $(pwd)/flyway-5.2.4/flyway /usr/local/bin/
  popd
fi