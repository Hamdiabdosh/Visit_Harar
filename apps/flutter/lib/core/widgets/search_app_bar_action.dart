import 'package:flutter/material.dart';

import '../../routing/app_router.dart';

class SearchAppBarAction extends StatelessWidget {
  const SearchAppBarAction({super.key});

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.search),
      tooltip: 'Search',
      onPressed: () => pushAppRoute(context, '/search'),
    );
  }
}
