"""Validate generated XML fixtures with the bundled, unmodified official schemas.

Run verify-fiscal-xml-reform.js with RTC_XML_OUTPUT pointing to a temporary folder,
then: python scripts/verify-fiscal-xsd.py <that-folder>. Requires lxml.
NFe scope excludes signature and QR supplement; this does not authorize an invoice.
"""
from pathlib import Path
from copy import deepcopy
import json
import sys
from lxml import etree

root = Path(__file__).resolve().parents[1]
schemas = root / 'runtime/fiscal/Schemas'
fixtures = Path(sys.argv[1])
doc = etree.parse(str(schemas / 'leiauteNFe_v4.00.xsd'))
ns = {'x': 'http://www.w3.org/2001/XMLSchema'}
node = deepcopy(doc.xpath('//x:complexType[@name="TNFe"]/x:sequence/x:element[@name="infNFe"]', namespaces=ns)[0])
for key in ['minOccurs', 'maxOccurs']:
    node.attrib.pop(key, None)
for constraint in node.xpath('.//x:unique | .//x:key | .//x:keyref', namespaces=ns):
    constraint.set('name', constraint.get('name') + '_test')
doc.getroot().append(node)
nfe = etree.XMLSchema(doc)
dps = etree.XMLSchema(etree.parse(str(schemas / 'NFSeNacional/DPS_v1.01.xsd')))
results = []
for name in ['NF-e', 'NFC-e', 'NF-e-reducao', 'NF-e-diferimento', 'NF-e-isencao', 'DPS']:
    schema = dps if name == 'DPS' else nfe
    xml = etree.parse(str(fixtures / (name + '.xml'))).getroot()
    if name != 'DPS':
        xml = xml[0]
    results.append({'fixture': name, 'passed': schema.validate(xml), 'errors': str(schema.error_log)})
print(json.dumps(results, ensure_ascii=True, indent=2))
sys.exit(0 if all(result['passed'] for result in results) else 1)
