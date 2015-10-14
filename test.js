var subject = require('./subject.js')
var mock = require('mock-fs');
subject.inc('',undefined);
subject.inc('','utestingndefined');
subject.inc(-2,'utestingndefined');
subject.inc(2,'utestingndefined');
subject.weird(5,'','','');
subject.weird(9,'','','');
subject.weird(9,-2,'','');
subject.weird(9,2,'','');
subject.weird(9,2,40,'');
subject.weird(9,2,44,'');
subject.weird(9,2,44,"strict");
subject.weird(9,2,44,'"testingstrict"');
mock({"path/fileExists":{},"path/fileExists1":{"newContent":{"file2":"text content"}},"pathContent":{"file1":"text content","file2":""}});
	subject.fileTest('','demopath');
mock.restore();
mock({"pathContent":{"file1":"text content","file2":""}});
	subject.fileTest('','demopath');
mock.restore();
mock({"path/fileExists":{},"path/fileExists1":{"newContent":{"file2":"text content"}}});
	subject.fileTest('','demopath');
mock.restore();
mock({});
	subject.fileTest('','demopath');
mock.restore();
mock({"path/fileExists":{},"path/fileExists1":{"newContent":{"file2":"text content"}},"pathContent":{"file1":"text content","file2":""}});
	subject.fileTest('','demopath');
mock.restore();
mock({"pathContent":{"file1":"text content","file2":""}});
	subject.fileTest('','demopath');
mock.restore();
mock({"path/fileExists":{},"path/fileExists1":{"newContent":{"file2":"text content"}}});
	subject.fileTest('','demopath');
mock.restore();
mock({});
	subject.fileTest('','demopath');
mock.restore();
mock({"path/fileExists":{},"path/fileExists1":{"newContent":{"file2":"text content"}},"pathContent":{"file1":"text content","file2":""}});
	subject.fileTest('path/fileExists','demopath');
mock.restore();
mock({"pathContent":{"file1":"text content","file2":""}});
	subject.fileTest('path/fileExists','demopath');
mock.restore();
mock({"path/fileExists":{},"path/fileExists1":{"newContent":{"file2":"text content"}}});
	subject.fileTest('path/fileExists','demopath');
mock.restore();
mock({});
	subject.fileTest('path/fileExists','demopath');
mock.restore();
mock({"path/fileExists":{},"path/fileExists1":{"newContent":{"file2":"text content"}},"pathContent":{"file1":"text content","file2":""}});
	subject.fileTest('path/fileExists1','demopath');
mock.restore();
mock({"pathContent":{"file1":"text content","file2":""}});
	subject.fileTest('path/fileExists1','demopath');
mock.restore();
mock({"path/fileExists":{},"path/fileExists1":{"newContent":{"file2":"text content"}}});
	subject.fileTest('path/fileExists1','demopath');
mock.restore();
mock({});
	subject.fileTest('path/fileExists1','demopath');
mock.restore();
mock({"path/fileExists":{},"path/fileExists1":{"newContent":{"file2":"text content"}},"pathContent":{"file1":"text content","file2":""}});
	subject.fileTest('path/fileExists1','pathContent/file1');
mock.restore();
mock({"pathContent":{"file1":"text content","file2":""}});
	subject.fileTest('path/fileExists1','pathContent/file1');
mock.restore();
mock({"path/fileExists":{},"path/fileExists1":{"newContent":{"file2":"text content"}}});
	subject.fileTest('path/fileExists1','pathContent/file1');
mock.restore();
mock({});
	subject.fileTest('path/fileExists1','pathContent/file1');
mock.restore();
mock({"path/fileExists":{},"path/fileExists1":{"newContent":{"file2":"text content"}},"pathContent":{"file1":"text content","file2":""}});
	subject.fileTest('path/fileExists1','pathContent/file2');
mock.restore();
mock({"pathContent":{"file1":"text content","file2":""}});
	subject.fileTest('path/fileExists1','pathContent/file2');
mock.restore();
mock({"path/fileExists":{},"path/fileExists1":{"newContent":{"file2":"text content"}}});
	subject.fileTest('path/fileExists1','pathContent/file2');
mock.restore();
mock({});
	subject.fileTest('path/fileExists1','pathContent/file2');
mock.restore();
mock({"path/fileExists":{},"path/fileExists1":{"newContent":{"file2":"text content"}},"pathContent":{"file1":"text content","file2":""}});
	subject.fileTest('path/fileExists1','pathContent/file1');
mock.restore();
mock({"pathContent":{"file1":"text content","file2":""}});
	subject.fileTest('path/fileExists1','pathContent/file1');
mock.restore();
mock({"path/fileExists":{},"path/fileExists1":{"newContent":{"file2":"text content"}}});
	subject.fileTest('path/fileExists1','pathContent/file1');
mock.restore();
mock({});
	subject.fileTest('path/fileExists1','pathContent/file1');
mock.restore();
subject.normalize('429-962-6251');
subject.normalize('');
subject.format('117-234-2133','','');
subject.format('','','');
subject.format('','','');
subject.format('','','');
subject.format('','',{"normalize":true});
subject.format('','',{"normalize":false});
subject.blackListNumber('405-229-6536');
subject.blackListNumber('');
subject.blackListNumber('212-449-4205');
