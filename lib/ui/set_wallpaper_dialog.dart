import 'package:flutter/material.dart';
import 'package:logging/logging.dart';
import 'package:photos/models/file.dart';
import 'package:photos/utils/dialog_util.dart';
import 'package:photos/utils/file_util.dart';
import 'package:photos/utils/toast_util.dart';
import 'package:wallpaper_manager_flutter/wallpaper_manager_flutter.dart';

class SetWallpaperDialog extends StatefulWidget {
  final File file;

  const SetWallpaperDialog(this.file, {Key key}) : super(key: key);

  @override
  _SetWallpaperDialogState createState() => _SetWallpaperDialogState();
}

class _SetWallpaperDialogState extends State<SetWallpaperDialog> {
  int _lockscreenValue = WallpaperManagerFlutter.HOME_SCREEN;

  @override
  Widget build(BuildContext context) {
    final alert = AlertDialog(
      title: Text("Set wallpaper"),
      content: Container(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile(
              title: const Text("Homescreen"),
              value: WallpaperManagerFlutter.HOME_SCREEN,
              groupValue: _lockscreenValue,
              onChanged: (v) {
                setState(() {
                  _lockscreenValue = v;
                });
              },
            ),
            RadioListTile(
              title: const Text("Lockscreen"),
              value: WallpaperManagerFlutter.LOCK_SCREEN,
              groupValue: _lockscreenValue,
              onChanged: (v) {
                setState(() {
                  _lockscreenValue = v;
                });
              },
            ),
            RadioListTile(
              title: const Text("Both"),
              value: WallpaperManagerFlutter.BOTH_SCREENS,
              groupValue: _lockscreenValue,
              onChanged: (v) {
                setState(() {
                  _lockscreenValue = v;
                });
              },
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          child: Text(
            "Ok",
            style: TextStyle(
              color: Colors.white,
            ),
          ),
          onPressed: () async {
            Navigator.of(context, rootNavigator: true).pop('dialog');
            final dialog = createProgressDialog(context, "Setting wallpaper");
            await dialog.show();
            try {
              await WallpaperManagerFlutter().setwallpaperfromFile(
                  await getFile(widget.file), _lockscreenValue);
              await dialog.hide();
              showToast("Wallpaper set successfully");
            } catch (e, s) {
              await dialog.hide();
              Logger("SetWallpaperDialog").severe(e, s);
              showToast("Something went wrong");
              return;
            }
          },
        ),
      ],
    );
    return alert;
  }
}
