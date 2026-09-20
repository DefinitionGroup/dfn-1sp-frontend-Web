import assert from 'node:assert/strict';
import test from 'node:test';
import {createRequire} from 'node:module';
import {PatchEvent, set, setIfMissing, insert, unset} from 'sanity';
import {compactCloudinaryStorage, cloudinaryBookkeepingPaths} from '../packages/utils/src/cloudinary-storage';
import {assetUrl, isVideoAsset, optimizedImageUrl, optimizedVideoUrl, cloudinaryPosterUrl} from '../packages/utils/src/cloudinary';
import {cloudinaryAssetSchema} from 'sanity-plugin-cloudinary';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
import {CloudinaryStorageInput, compactCloudinaryPatches} from '../sanity/components/CloudinaryStorageInput';

const pluginRequire = createRequire(createRequire(import.meta.url).resolve('sanity-plugin-cloudinary'));
const {ThemeProvider, studioTheme} = pluginRequire('@sanity/ui');

const asset = {_type:'cloudinary.asset', _key:'a', _version:1, public_id:'folder/video', asset_id:'id',
  secure_url:'https://res.cloudinary.com/example/video/upload/v1/video.mp4', resource_type:'video',
  width:1920, height:1080, duration:4.2, version:1, tags:['keep'], metadata:{format:'mp4',asset_folder:'business-data'},
  bytes:123456,created_at:'2026-01-01T00:00:00Z',access_mode:'public',access_control:[],
  display_name:'Video',original_filename:'video',format:'mp4',type:'upload',
  context:{custom:{alt:'Caption'}}, created_by:{id:'operator'},uploaded_by:{id:'operator'},folder_id:'folder',asset_folder:'folder'};

test('removes redundant provider fields from assets, preserving editorial and unrelated data',()=>{
  const input={asset,asset_folder:'unrelated',other:{created_by:'keep'}, wrapper:{alt:'Alt',focusX:40,asset}};
  const cleaned=compactCloudinaryStorage(input);
  assert.equal(cleaned.asset_folder,'unrelated');assert.deepEqual(cleaned.other,input.other);
  assert.equal(cleaned.wrapper.focusX,40);assert.equal(cleaned.wrapper.alt,'Alt');
  const {created_by,uploaded_by,folder_id,asset_folder,_version,bytes,created_at,access_mode,access_control,...expected}=asset;
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
  assert.equal(compactCloudinaryPatches([set('folder',['asset_folder'])],true)[0].type,'unset');
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
    'content[0].image.asset._version','content[0].image.asset.bytes','content[0].image.asset.created_at',
    'content[0].image.asset.access_mode','content[0].image.asset.access_control',
    'content[0].image.asset.created_by','content[0].image.asset.uploaded_by',
    'content[0].image.asset.folder_id','content[0].image.asset.asset_folder',
  ]);
});


test('retains access restrictions and unknown plugin versions, including direct patches',()=>{
  const restricted={...asset,_version:2,access_mode:'authenticated',access_control:[{access_type:'token'}]};
  const cleaned=compactCloudinaryStorage(restricted);
  assert.equal(cleaned._version,2);
  assert.equal(cleaned.access_mode,'authenticated');
  assert.deepEqual(cleaned.access_control,restricted.access_control);
  for(const field of ['access_mode','access_control','_version'] as const){
    const patch=set(restricted[field],[field]);
    assert.deepEqual(compactCloudinaryPatches([patch],true),[patch]);
  }
  assert.equal(compactCloudinaryPatches([set('public',['access_mode'])],true)[0].type,'unset');
  assert.deepEqual(compactCloudinaryPatches([setIfMissing('public',['access_mode'])],true),[]);
});

test('actual plugin previews and shared delivery helpers are unchanged for image/video/raw assets',()=>{
  for(const resource_type of ['video','image','raw']){
    const original={...asset,resource_type};
    const cleaned=compactCloudinaryStorage(original);
    for(const helper of [assetUrl,isVideoAsset, (a:typeof asset)=>optimizedImageUrl(assetUrl(a)),
      (a:typeof asset)=>optimizedVideoUrl(assetUrl(a)),(a:typeof asset)=>cloudinaryPosterUrl(assetUrl(a))]){
      assert.deepEqual(helper(cleaned),helper(original));
    }
    const Preview=cloudinaryAssetSchema.components!.preview as any;
    const render=(value:unknown)=>renderToStaticMarkup(createElement(ThemeProvider,{theme:studioTheme},createElement(Preview,{value,layout:'default'})));
    assert.equal(render(cleaned),render(original));
  }
});
