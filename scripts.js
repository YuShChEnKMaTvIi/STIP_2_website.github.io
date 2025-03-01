function toggleContent(contentId) {
    // Найти элемент с переданным ID
    var activeContent = document.getElementById(contentId);
    
    // Проверить, виден ли уже этот элемент
    if (activeContent.classList.contains('active-content')) {
        // Если видим, скрыть его
        activeContent.classList.remove('active-content');
        activeContent.classList.add('hidden-content');
    } else {
        // Если не видим, скрыть все элементы с классом .hidden-content
        var contents = document.querySelectorAll('.hidden-content');
        contents.forEach(function(content) {
            content.classList.remove('active-content');
            content.classList.add('hidden-content');
        });
        
        // Показать нужный элемент
        activeContent.classList.remove('hidden-content');
        activeContent.classList.add('active-content');
    }
}
