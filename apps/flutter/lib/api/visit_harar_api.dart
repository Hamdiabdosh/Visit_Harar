import 'package:dio/dio.dart';

import '../config/env.dart';
import 'models.dart';

/// HTTP client for `/api/v1` — mirrors `packages/api-client`.
class VisitHararApi {
  VisitHararApi({Dio? dio, String? baseUrl})
      : _dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: baseUrl ?? Env.apiV1,
                headers: {'accept': 'application/json'},
                connectTimeout: const Duration(seconds: 15),
                receiveTimeout: const Duration(seconds: 30),
              ),
            );

  final Dio _dio;

  Future<T> _getData<T>(
    String path,
    T Function(dynamic json) parse, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        path,
        queryParameters: queryParameters,
      );
      return _parseEnvelope(response.data, parse);
    } on DioException catch (e) {
      throw _mapDioError(e);
    }
  }

  Future<T> _postData<T>(
    String path,
    T Function(dynamic json) parse, {
    Map<String, dynamic>? body,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        path,
        data: body,
        options: Options(headers: {'content-type': 'application/json'}),
      );
      return _parseEnvelope(response.data, parse);
    } on DioException catch (e) {
      throw _mapDioError(e);
    }
  }

  T _parseEnvelope<T>(
    Map<String, dynamic>? body,
    T Function(dynamic json) parse,
  ) {
    if (body == null || body['ok'] != true) {
      throw ApiException('HTTP_ERROR', 'Empty response');
    }
    return parse(body['data']);
  }

  ApiException _mapDioError(DioException e) {
    final data = e.response?.data;
    if (data is Map && data['ok'] == false && data['error'] is Map) {
      final err = data['error'] as Map;
      return ApiException(
        err['code'] as String? ?? 'HTTP_ERROR',
        err['message'] as String? ?? e.message ?? 'Request failed',
        statusCode: e.response?.statusCode ?? 0,
      );
    }
    return ApiException(
      'NETWORK',
      e.message ?? 'Network error',
      statusCode: e.response?.statusCode ?? 0,
    );
  }

  /// Older production hosts may expose POST booking routes before GET flag routes.
  Future<T> _getFeatureFlag<T>(
    String path,
    T Function(dynamic json) parse, {
    required T fallbackWhenMissing,
  }) async {
    try {
      return await _getData(path, parse);
    } on ApiException catch (e) {
      if (e.code == 'NOT_FOUND' && e.statusCode == 404) {
        return fallbackWhenMissing;
      }
      rethrow;
    }
  }

  Future<Map<String, dynamic>> index() =>
      _getData('/', (json) => json as Map<String, dynamic>);

  Future<List<AttractionSummary>> getAttractions() => _getData(
        '/attractions',
        (json) => parseList(json, AttractionSummary.fromJson),
      );

  Future<AttractionSummary> getAttraction(String slug) => _getData(
        '/attractions/$slug',
        (json) => AttractionSummary.fromJson(json as Map<String, dynamic>),
      );

  Future<List<GuideSummary>> getGuides() => _getData(
        '/guides',
        (json) => parseList(json, GuideSummary.fromJson),
      );

  Future<GuideSummary> getGuide(String slug) => _getData(
        '/guides/$slug',
        (json) => GuideSummary.fromJson(json as Map<String, dynamic>),
      );

  Future<List<MapPoi>> getMapPois() => _getData(
        '/map/pois',
        (json) => parseList(json, MapPoi.fromJson),
      );

  Future<List<ItinerarySummary>> getItineraries() => _getData(
        '/itineraries',
        (json) => parseList(json, ItinerarySummary.fromJson),
      );

  Future<ItinerarySummary> getItinerary(String slug) => _getData(
        '/itineraries/$slug',
        (json) => ItinerarySummary.fromJson(json as Map<String, dynamic>),
      );

  Future<PaginatedAnnouncements> getAnnouncements({
    int page = 1,
    int perPage = 20,
    String? type,
  }) =>
      _getData(
        '/announcements',
        (json) =>
            PaginatedAnnouncements.fromJson(json as Map<String, dynamic>),
        queryParameters: {
          'page': page,
          'per_page': perPage,
          if (type != null) 'type': type,
        },
      );

  Future<AnnouncementSummary> getAnnouncement(String slug) => _getData(
        '/announcements/$slug',
        (json) => AnnouncementSummary.fromJson(json as Map<String, dynamic>),
      );

  Future<Map<String, dynamic>> getPage(String key) => _getData(
        '/pages/$key',
        (json) => json as Map<String, dynamic>,
      );

  Future<HeroContent?> getHero() async {
    try {
      return await _getData(
        '/hero',
        (json) => HeroContent.fromJson(json as Map<String, dynamic>),
      );
    } on ApiException catch (e) {
      if (e.statusCode == 404) return null;
      rethrow;
    }
  }

  Future<ContactInfo?> getContact() async {
    try {
      return await _getData(
        '/contact',
        (json) => ContactInfo.fromJson(json as Map<String, dynamic>),
      );
    } on ApiException catch (e) {
      if (e.statusCode == 404) return null;
      rethrow;
    }
  }

  Future<SearchResult> search(String q, {int limit = 15}) => _getData(
        '/search',
        (json) => SearchResult.fromJson(json as Map<String, dynamic>),
        queryParameters: {'q': q, 'limit': limit},
      );

  Future<List<PartnerSummary>> getPartners({String? category}) => _getData(
        '/partners',
        (json) => parseList(json, PartnerSummary.fromJson),
        queryParameters: {
          if (category != null && category.isNotEmpty) 'category': category,
        },
      );

  Future<List<GalleryAlbumSummary>> getGalleryAlbums() => _getData(
        '/gallery/albums',
        (json) => parseList(json, GalleryAlbumSummary.fromJson),
      );

  Future<GalleryAlbumDetail> getGalleryAlbum(String id) => _getData(
        '/gallery/albums/$id',
        (json) => GalleryAlbumDetail.fromJson(json as Map<String, dynamic>),
      );

  Future<bool> getBookingEnabled() => _getFeatureFlag(
        '/bookings/enabled',
        (json) => (json as Map<String, dynamic>)['enabled'] as bool? ?? false,
        fallbackWhenMissing: true,
      );

  Future<bool> getPushEnabled() => _getFeatureFlag(
        '/push/enabled',
        (json) => (json as Map<String, dynamic>)['enabled'] as bool? ?? false,
        fallbackWhenMissing: false,
      );

  Future<String> createBooking(BookingInput input) => _postData(
        '/bookings',
        (json) => (json as Map<String, dynamic>)['booking_ref'] as String,
        body: input.toJson(),
      );

  Future<BookingStatus> getBookingStatus(BookingStatusInput input) =>
      _postData(
        '/bookings/status',
        (json) => BookingStatus.fromJson(json as Map<String, dynamic>),
        body: input.toJson(),
      );

  Future<void> submitInquiry(InquiryInput input) async {
    await _postData<void>(
      '/inquiries',
      (_) {},
      body: input.toJson(),
    );
  }

  Future<EventRegistrationResult> createEventRegistration(
    EventRegistrationInput input,
  ) =>
      _postData(
        '/events/registrations',
        (json) => EventRegistrationResult.fromJson(
          json as Map<String, dynamic>,
        ),
        body: input.toJson(),
      );

  Future<EventRegistrationStatus> getEventRegistrationStatus(
    EventRegistrationStatusInput input,
  ) =>
      _postData(
        '/events/registrations/status',
        (json) => EventRegistrationStatus.fromJson(
          json as Map<String, dynamic>,
        ),
        body: input.toJson(),
      );

  Future<void> registerPush(PushRegisterInput input) async {
    await _postData<void>(
      '/push/register',
      (_) {},
      body: input.toJson(),
    );
  }
}
