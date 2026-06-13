import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/models.dart';
import '../../api/visit_harar_api.dart';
import '../storage/poi_cache.dart';

final apiProvider = Provider<VisitHararApi>((ref) => VisitHararApi());

final attractionsProvider = FutureProvider<List<AttractionSummary>>((ref) async {
  final api = ref.watch(apiProvider);
  return api.getAttractions();
});

final attractionProvider =
    FutureProvider.family<AttractionSummary, String>((ref, slug) async {
  final api = ref.watch(apiProvider);
  return api.getAttraction(slug);
});

final guidesProvider = FutureProvider<List<GuideSummary>>((ref) async {
  final api = ref.watch(apiProvider);
  return api.getGuides();
});

final guideProvider = FutureProvider.family<GuideSummary, String>((ref, slug) async {
  final api = ref.watch(apiProvider);
  return api.getGuide(slug);
});

final itinerariesProvider = FutureProvider<List<ItinerarySummary>>((ref) async {
  final api = ref.watch(apiProvider);
  return api.getItineraries();
});

final itineraryProvider =
    FutureProvider.family<ItinerarySummary, String>((ref, slug) async {
  final api = ref.watch(apiProvider);
  return api.getItinerary(slug);
});

final announcementsProvider =
    FutureProvider.family<PaginatedAnnouncements, AnnouncementQuery>((ref, query) async {
  final api = ref.watch(apiProvider);
  return api.getAnnouncements(
    page: query.page,
    perPage: query.perPage,
    type: query.type,
  );
});

final announcementProvider =
    FutureProvider.family<AnnouncementSummary, String>((ref, slug) async {
  final api = ref.watch(apiProvider);
  return api.getAnnouncement(slug);
});

final mapPoisProvider = FutureProvider<List<MapPoi>>((ref) async {
  final api = ref.watch(apiProvider);
  try {
    final pois = await api.getMapPois();
    await PoiCache.save(pois);
    return pois;
  } catch (_) {
    final cached = await PoiCache.load();
    if (cached != null && cached.isNotEmpty) return cached;
    rethrow;
  }
});

final bookingEnabledProvider = FutureProvider<bool>((ref) async {
  final api = ref.watch(apiProvider);
  return api.getBookingEnabled();
});

final pushEnabledProvider = FutureProvider<bool>((ref) async {
  final api = ref.watch(apiProvider);
  return api.getPushEnabled();
});

final heroProvider = FutureProvider<HeroContent?>((ref) async {
  final api = ref.watch(apiProvider);
  return api.getHero();
});

final featuredAttractionsProvider =
    FutureProvider<List<AttractionSummary>>((ref) async {
  final attractions = await ref.watch(attractionsProvider.future);
  return attractions.where((a) => a.isFeatured).take(6).toList();
});

final searchProvider = FutureProvider.family<SearchResult, String>((ref, query) async {
  final trimmed = query.trim();
  if (trimmed.length < 2) {
    return SearchResult(query: trimmed, results: const []);
  }
  final api = ref.watch(apiProvider);
  return api.search(trimmed, limit: 30);
});

final contactProvider = FutureProvider<ContactInfo?>((ref) async {
  final api = ref.watch(apiProvider);
  return api.getContact();
});

final partnersProvider = FutureProvider<List<PartnerSummary>>((ref) async {
  final api = ref.watch(apiProvider);
  return api.getPartners();
});

final galleryAlbumsProvider = FutureProvider<List<GalleryAlbumSummary>>((ref) async {
  final api = ref.watch(apiProvider);
  return api.getGalleryAlbums();
});

final galleryAlbumProvider =
    FutureProvider.family<GalleryAlbumDetail, String>((ref, id) async {
  final api = ref.watch(apiProvider);
  return api.getGalleryAlbum(id);
});

class AnnouncementQuery {
  const AnnouncementQuery({this.page = 1, this.perPage = 20, this.type});

  final int page;
  final int perPage;
  final String? type;

  @override
  bool operator ==(Object other) =>
      other is AnnouncementQuery &&
      other.page == page &&
      other.perPage == perPage &&
      other.type == type;

  @override
  int get hashCode => Object.hash(page, perPage, type);
}

const defaultAnnouncementsQuery = AnnouncementQuery();
