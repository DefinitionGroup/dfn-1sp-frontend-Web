import { defineField } from 'sanity';

export function caseDiscoveryField(group?: string) {
  return defineField({ name: 'discovery', title: 'Campaign discovery', type: 'object', ...(group ? {group} : {}),
    description: 'Use verified campaign territories and explicitly documented genres/platforms. Website editions can override this complete group.',
    fields: [
      defineField({ name: 'regions', title: 'Campaign regions', type: 'array', of: [{type:'string'}], options: {list: [
        {title:'United Kingdom',value:'uk-campaigns'}, {title:'EMEA',value:'emea-campaigns'},
        {title:'North America',value:'na-campaigns'}, {title:'Worldwide',value:'worldwide-campaigns'},
      ]} }),
      defineField({name:'genres',title:'Genres',type:'array',of:[{type:'string'}],options:{layout:'tags'}}),
      defineField({name:'platforms',title:'Platforms',type:'array',of:[{type:'string'}],options:{layout:'tags'}}),
    ] });
}
