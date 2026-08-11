const flzrStyleChannels = new Set(['flizrWeb', 'renaissanceWeb']);

export function isFlzrStyleChannel(channel: unknown) {
    return typeof channel === 'string' && flzrStyleChannels.has(channel);
}

export function hideForFlzrPage({ document }: any) {
    return isFlzrStyleChannel(document?.channel);
}

export function hideForFlzrOnlyCase({ document }: any) {
    const channel = document?.channel;

    if (isFlzrStyleChannel(channel)) return true;
    if (!Array.isArray(channel)) return false;

    return channel.length === 1 && isFlzrStyleChannel(channel[0]);
}
