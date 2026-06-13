import '../../config/env.dart';

/// Resolve CMS media URLs (absolute or site-relative).
String? resolveMediaUrl(String? url) {
  if (url == null || url.isEmpty) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return '${Env.apiBaseUrl}$url';
  return url;
}

bool _isLocalUploadUrl(String url) {
  if (url.startsWith('/uploads/')) return true;
  final uri = Uri.tryParse(url);
  return uri != null && uri.path.startsWith('/uploads/');
}

/// Derive the `-thumb.webp` sibling for locally stored WebP files.
String? localThumbUrl(String? url) {
  if (url == null || url.isEmpty || !_isLocalUploadUrl(url)) return null;
  final lower = url.toLowerCase();
  if (lower.endsWith('-thumb.webp')) return url;
  if (!lower.endsWith('.webp')) return null;
  return url.replaceFirst(RegExp(r'\.webp$', caseSensitive: false), '-thumb.webp');
}

/// Prefer explicit thumbnail, then derived local thumb, then full URL.
String? pickListImageUrl(String? url, {String? thumbnailUrl}) {
  if (thumbnailUrl != null && thumbnailUrl.isNotEmpty) {
    return resolveMediaUrl(thumbnailUrl);
  }
  final derived = localThumbUrl(url);
  if (derived != null) return resolveMediaUrl(derived);
  return resolveMediaUrl(url);
}
