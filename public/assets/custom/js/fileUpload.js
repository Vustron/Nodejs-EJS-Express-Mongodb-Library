// Initialization
FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
)

FilePond.setOptions({
    stylePanelAspectRatio: 63 / 100,
    imageResizeTargetWidth: 100,
    imageResizeTargetHeight: 150,
})

FilePond.parse(document.body);