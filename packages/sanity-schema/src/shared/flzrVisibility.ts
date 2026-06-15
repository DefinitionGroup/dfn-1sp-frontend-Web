export function hideForFlzrPage({ document }: any) {
    return document?.channel === 'flizrWeb';
}

export function hideForFlzrOnlyCase({ document }: any) {
    const channel = document?.channel;

    if (channel === 'flizrWeb') return true;
    if (!Array.isArray(channel)) return false;

    return channel.length === 1 && channel[0] === 'flizrWeb';
}
