import assert from 'node:assert/strict';
import test from 'node:test';
import {PatchEvent, set, setIfMissing, insert, unset} from 'sanity';
import {compactCloudinaryStorage, cloudinaryBookkeepingPaths} from '../packages/utils/src/cloudinary-storage';
import {CloudinaryStorageInput, compactCloudinaryPatches} from '../sanity/components/CloudinaryStorageInput';

const asset = {_type:'cloudinary.asset', _key:'a', _version:1, public_id:'folder/video', asset_id:'id',
  secure_url:'https://res.cloudinary.com/example/video/upload/v1/video.mp4', resource_type:'video',
  width:1920, height:1080, duration:4.2, version:1, tags:['keep'], metadata:{format:'mp4',asset_folder:'business-data'},
  context:{custom:{alt:'Caption'}}, created_by:{id:'operator'},uploaded_by:{id:'operator'},folder_id:'folder',asset_folder:'folder'};

test('removes only four provider fields from assets, preserving editorial and unrelated data',()=>{
  const input={asset,asset_folder:'unrelated',other:{created_by:'keep'}, wrapper:{alt:'Alt',focusX:40,asset}};
  const cleaned=compactCloudinaryStorage(input);
  assert.equal(cleaned.asset_folder,'unrelated');assert.deepEqual(cleaned.other,input.other);
  assert.equal(cleaned.wrapper.focusX,40);assert.equal(cleaned.wrapper.alt,'Alt');
  const {created_by,uploaded_by,folder_id,asset_folder,...expected}=asset;
  assert.deepEqual(cleaned.asset,expected);assert.deepEqual(cleaned.wrapper.asset,expected);
  assert.deepEqual(compactCloudinaryStorage(cleaned),cleaned);assert.equal(asset.folder_id,'folder');
});
test('plugin replacement, array insertion and whole-block paste use the same policy',()=>{
  for(const patch of [set(asset),setIfMissing(asset),insert([asset],'after',[-1]),set({content:[{image:asset}]})]){
    const [cleaned]=compactCloudinaryPatches([patch],false);
    assert.deepEqual(cloudinaryBookkeepingPaths(cleaned),[]);
    assert.equal(cleaned.type,patch.type);
  }
  assert.deepEqual(compactCloudinaryPatches([unset(['image'])],false),[unset(['image'])]);
  assert.equal(compactCloudinaryPatches([set('folder',['asset_folder'])],true).length,0);
  assert.equal(compactCloudinaryPatches([set('folder',['asset_folder'])],false).length,1);
});
test('Studio middleware forwards sanitized patches through renderDefault without writing on mount',()=>{
  const emitted:any[]=[];let wrapped:any;
  CloudinaryStorageInput({schemaType:{name:'array'},onChange:(e:any)=>emitted.push(e),renderDefault:(p:any)=>{wrapped=p;return null}} as any);
  assert.equal(emitted.length,0);
  wrapped.onChange(PatchEvent.from(insert([asset],'after',[-1])));
  assert.equal(emitted[0].patches[0].items[0].public_id,asset.public_id);
  assert.deepEqual(cloudinaryBookkeepingPaths(emitted[0].patches),[]);
});
test('migration paths cover nested arrays and wrappers without touching matching business keys',()=>{
  assert.deepEqual(cloudinaryBookkeepingPaths({content:[{image:{asset}}],created_by:'keep'}),[
    'content[0].image.asset.created_by','content[0].image.asset.uploaded_by',
    'content[0].image.asset.folder_id','content[0].image.asset.asset_folder',
  ]);
});
