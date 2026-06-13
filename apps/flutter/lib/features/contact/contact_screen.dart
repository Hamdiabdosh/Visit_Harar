import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../api/models.dart';
import '../../core/providers/api_providers.dart';
import '../../core/theme/app_theme.dart';
import '../../routing/app_router.dart';
import '../../core/widgets/content_widgets.dart';
import '../../core/widgets/form_widgets.dart';
import '../../core/widgets/page_widgets.dart';

class ContactScreen extends ConsumerStatefulWidget {
  const ContactScreen({super.key});

  @override
  ConsumerState<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends ConsumerState<ContactScreen> {
  late final _nameController = TextEditingController();
  late final _emailController = TextEditingController();
  late final _subjectController = TextEditingController();
  late final _messageController = TextEditingController();

  bool _submitting = false;
  String _submitError = '';

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  String? _validateForm() {
    final name = _nameController.text.trim();
    if (name.length < 2) return 'Name must be at least 2 characters';

    final email = _emailController.text.trim();
    if (!email.contains('@') || email.length < 5) {
      return 'Enter a valid email address';
    }

    final subject = _subjectController.text.trim();
    if (subject.length < 3) return 'Subject must be at least 3 characters';

    final message = _messageController.text.trim();
    if (message.length < 10) {
      return 'Message must be at least 10 characters';
    }

    return null;
  }

  Future<void> _submit() async {
    final validationError = _validateForm();
    if (validationError != null) {
      setState(() => _submitError = validationError);
      return;
    }

    setState(() {
      _submitting = true;
      _submitError = '';
    });

    try {
      final api = ref.read(apiProvider);
      await api.submitInquiry(
        InquiryInput(
          name: _nameController.text.trim(),
          email: _emailController.text.trim(),
          subject: _subjectController.text.trim(),
          message: _messageController.text.trim(),
        ),
      );

      _nameController.clear();
      _emailController.clear();
      _subjectController.clear();
      _messageController.clear();

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Inquiry sent. The commission will respond to your email soon.',
          ),
        ),
      );
    } catch (e) {
      setState(() => _submitError = errorMessage(e));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final contactAsync = ref.watch(contactProvider);

    return Scaffold(
      appBar: appBarWithBack(context: context, title: 'Contact'),
      body: contactAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ApiErrorBody(
          message: errorMessage(e),
          onRetry: () => ref.invalidate(contactProvider),
        ),
        data: (contact) {
          if (contact == null) {
            return const EmptyState(
              title: 'Contact coming soon',
              message:
                  'Contact information will be published by the commission soon.',
              icon: Icons.mail_outline,
            );
          }

          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
            children: [
              const ListIntro(
                text:
                    "We're here to help with any question about visiting Harar.",
              ),
              _ContactInfoCard(contact: contact),
              const SizedBox(height: 16),
              _InquiryFormCard(
                nameController: _nameController,
                emailController: _emailController,
                subjectController: _subjectController,
                messageController: _messageController,
                submitting: _submitting,
                error: _submitError,
                onSubmit: _submit,
              ),
            ],
          );
        },
      ),
    );
  }
}

class _ContactInfoCard extends StatelessWidget {
  const _ContactInfoCard({required this.contact});

  final ContactInfo contact;

  Future<void> _openUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final officeName = contact.officeName?.trim();
    final addressParts = [
      contact.addressLine1,
      contact.addressLine2,
      contact.country,
    ].where((part) => part != null && part.trim().isNotEmpty).join(', ');

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              officeName?.isNotEmpty == true
                  ? officeName!
                  : 'Harari Tourism Commission',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            if (addressParts.isNotEmpty)
              _ContactRow(
                icon: Icons.location_on_outlined,
                child: Text(addressParts),
              ),
            if (contact.phonePrimary != null &&
                contact.phonePrimary!.isNotEmpty)
              _ContactRow(
                icon: Icons.phone_outlined,
                child: InkWell(
                  onTap: () => _openUrl('tel:${contact.phonePrimary}'),
                  child: Text(
                    contact.phonePrimary!,
                    style: const TextStyle(color: AppColors.brand),
                  ),
                ),
              ),
            if (contact.emailGeneral != null &&
                contact.emailGeneral!.isNotEmpty)
              _ContactRow(
                icon: Icons.mail_outline,
                child: InkWell(
                  onTap: () => _openUrl('mailto:${contact.emailGeneral}'),
                  child: Text(
                    contact.emailGeneral!,
                    style: const TextStyle(color: AppColors.brand),
                  ),
                ),
              ),
            const SizedBox(height: 12),
            Text(
              'Working hours',
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            if (contact.workingHours.isEmpty)
              const Text(
                'Hours not published yet.',
                style: TextStyle(color: AppColors.inkMuted),
              )
            else
              ...contact.workingHours.map(
                (row) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    children: [
                      Expanded(child: Text(row.day)),
                      Text(
                        row.hours,
                        style: const TextStyle(color: AppColors.inkMuted),
                      ),
                    ],
                  ),
                ),
              ),
            if (contact.mapLat != null && contact.mapLng != null) ...[
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () => _openUrl(
                  'https://www.google.com/maps?q=${contact.mapLat},${contact.mapLng}',
                ),
                icon: const Icon(Icons.map_outlined),
                label: const Text('Open in Google Maps'),
              ),
            ],
            if (_socialLinks(contact).isNotEmpty) ...[
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                children: _socialLinks(contact)
                    .map(
                      (link) => IconButton.outlined(
                        onPressed: () => _openUrl(link.url),
                        icon: Icon(link.icon),
                        tooltip: link.label,
                      ),
                    )
                    .toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _SocialLink {
  const _SocialLink({
    required this.url,
    required this.icon,
    required this.label,
  });

  final String url;
  final IconData icon;
  final String label;
}

List<_SocialLink> _socialLinks(ContactInfo contact) {
  final links = <_SocialLink>[];
  void add(String? url, IconData icon, String label) {
    if (url != null && url.trim().isNotEmpty) {
      links.add(_SocialLink(url: url, icon: icon, label: label));
    }
  }

  add(contact.facebookUrl, Icons.facebook, 'Facebook');
  add(contact.twitterUrl, Icons.alternate_email, 'Twitter');
  add(contact.instagramUrl, Icons.camera_alt_outlined, 'Instagram');
  return links;
}

class _ContactRow extends StatelessWidget {
  const _ContactRow({required this.icon, required this.child});

  final IconData icon;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: AppColors.brand),
          const SizedBox(width: 10),
          Expanded(child: child),
        ],
      ),
    );
  }
}

class _InquiryFormCard extends StatelessWidget {
  const _InquiryFormCard({
    required this.nameController,
    required this.emailController,
    required this.subjectController,
    required this.messageController,
    required this.submitting,
    required this.error,
    required this.onSubmit,
  });

  final TextEditingController nameController;
  final TextEditingController emailController;
  final TextEditingController subjectController;
  final TextEditingController messageController;
  final bool submitting;
  final String error;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Send an inquiry',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            LabeledTextField(
              label: 'Name',
              controller: nameController,
            ),
            LabeledTextField(
              label: 'Email',
              controller: emailController,
              keyboardType: TextInputType.emailAddress,
              autocorrect: false,
            ),
            LabeledTextField(
              label: 'Subject',
              controller: subjectController,
            ),
            LabeledTextField(
              label: 'Message',
              controller: messageController,
              maxLines: 6,
            ),
            if (error.isNotEmpty) ...[
              Text(
                error,
                style: const TextStyle(color: Colors.red),
              ),
              const SizedBox(height: 8),
            ],
            FilledButton(
              onPressed: submitting ? null : onSubmit,
              child: Text(submitting ? 'Sending…' : 'Send inquiry'),
            ),
          ],
        ),
      ),
    );
  }
}
