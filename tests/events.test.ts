import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EPOCH,DAY,YEAR,schedule,skyDate,countdown} from '../src/events';
test('calendar epoch and year rollover',()=>{assert.deepEqual(skyDate(EPOCH),{year:1,month:1,day:1});assert.deepEqual(skyDate(EPOCH+YEAR),{year:2,month:1,day:1});});
test('spooky inclusive start and exclusive end',()=>{const start=EPOCH+(7*31+28)*DAY;assert.equal(schedule(start).find(e=>e.id==='spooky')?.active,true);assert.equal(schedule(start+3*DAY).some(e=>e.id==='spooky'&&e.active),false);});
test('mayor events require confirmed perks',()=>{assert.equal(schedule(EPOCH).some(e=>e.perk),false);assert.equal(schedule(EPOCH,['Fishing Festival']).filter(e=>e.id==='fishing').length,12);});
test('election crosses year boundary and closes Late Spring 27',()=>{const end=EPOCH+YEAR+(3*31+26)*DAY;assert.equal(schedule(end-1).find(e=>e.id==='election')?.active,true);assert.equal(schedule(end).find(e=>e.id==='election')?.active,false);});
test('countdown clamps at zero',()=>{assert.equal(countdown(-1),'0日 00:00:00');});
