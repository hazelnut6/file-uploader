// home
exports.getHome = (req, res) => {
    res.render('index', { title: 'File Uploader', errors: [], username: '' });
}

// upload
exports.postUpload = (req, res) => {
    // if successful, file info will be at req.file
    if(req.file) {
        console.log('File uploaded:', req.file); // save info to database(filename, path, size, ownerId)
        req.flash('success', 'File uploaded successfully!');
        res.redirect('/');
    } else {
        console.error('Upload error');
        req.flash('error', 'File uploading failed!');
        res.redirect('/');
    }
};