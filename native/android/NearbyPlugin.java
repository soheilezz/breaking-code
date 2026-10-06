package ir.soheil.breakingcode;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import com.google.android.gms.nearby.Nearby;
import com.google.android.gms.nearby.connection.AdvertisingOptions;
import com.google.android.gms.nearby.connection.ConnectionInfo;
import com.google.android.gms.nearby.connection.ConnectionLifecycleCallback;
import com.google.android.gms.nearby.connection.ConnectionResolution;
import com.google.android.gms.nearby.connection.ConnectionsClient;
import com.google.android.gms.nearby.connection.ConnectionsStatusCodes;
import com.google.android.gms.nearby.connection.DiscoveredEndpointInfo;
import com.google.android.gms.nearby.connection.DiscoveryOptions;
import com.google.android.gms.nearby.connection.EndpointDiscoveryCallback;
import com.google.android.gms.nearby.connection.Payload;
import com.google.android.gms.nearby.connection.PayloadCallback;
import com.google.android.gms.nearby.connection.PayloadTransferUpdate;
import com.google.android.gms.nearby.connection.Strategy;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * پل بین اپ و Google Nearby Connections (بلوتوث + BLE + وای‌فای مستقیم).
 * توپولوژی ستاره‌ای: یه میزبان، بقیه بهش وصل می‌شن.
 */
@CapacitorPlugin(
    name = "Nearby",
    permissions = {
        // اندروید ۱۲+: لوکیشن دقیق فقط همراه تقریبی و توی یک درخواست قبول می‌شه
        @Permission(alias = "loc", strings = { Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION }),
        @Permission(alias = "bt", strings = {
            Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_ADVERTISE, Manifest.permission.BLUETOOTH_CONNECT }),
        @Permission(alias = "wifi", strings = { Manifest.permission.NEARBY_WIFI_DEVICES })
    }
)
public class NearbyPlugin extends Plugin {
    private static final String SERVICE_ID = "ir.soheil.breakingcode.table";
    private static final Strategy STRATEGY = Strategy.P2P_STAR;

    private final Map<String, String> names = new HashMap<>();
    private final Set<String> connected = new HashSet<>();

    private ConnectionsClient client() { return Nearby.getConnectionsClient(getContext()); }

    private boolean has(String perm) {
        return ContextCompat.checkSelfPermission(getContext(), perm) == PackageManager.PERMISSION_GRANTED;
    }

    private boolean hasAccess() {
        int sdk = Build.VERSION.SDK_INT;
        boolean bt = has(Manifest.permission.BLUETOOTH_SCAN) && has(Manifest.permission.BLUETOOTH_ADVERTISE) && has(Manifest.permission.BLUETOOTH_CONNECT);
        if (sdk >= 33) return bt && has(Manifest.permission.NEARBY_WIFI_DEVICES);
        if (sdk >= 31) return bt && has(Manifest.permission.ACCESS_FINE_LOCATION);
        return has(Manifest.permission.ACCESS_FINE_LOCATION);
    }

    private String[] aliases() {
        int sdk = Build.VERSION.SDK_INT;
        if (sdk >= 33) return new String[] { "bt", "wifi" };
        if (sdk >= 31) return new String[] { "bt", "loc" };
        return new String[] { "loc" };
    }

    private boolean ensurePermissions(PluginCall call, String callback) {
        if (hasAccess()) return true;
        requestPermissionForAliases(aliases(), call, callback);
        return false;
    }

    private boolean locationOn() {
        LocationManager lm = (LocationManager) getContext().getSystemService(Context.LOCATION_SERVICE);
        if (lm == null) return true;
        if (Build.VERSION.SDK_INT >= 28) return lm.isLocationEnabled();
        return lm.isProviderEnabled(LocationManager.GPS_PROVIDER) || lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
    }

    private void open(Intent intent) {
        try { getActivity().startActivity(intent); } catch (Exception ignored) { }
    }

    // لوکیشن (اندروید ۱۲ و قدیمی‌تر) و بلوتوث باید روشن باشن؛ اگه نبود صفحهٔ روشن کردنش رو باز می‌کنیم
    private boolean radiosReady(PluginCall call) {
        if (Build.VERSION.SDK_INT < 33 && !locationOn()) {
            open(new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS));
            call.reject("لوکیشن (GPS) گوشی خاموشه. روشنش کن و برگرد، دوباره بزن.", "LOCATION_OFF");
            return false;
        }
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter != null && !adapter.isEnabled()) {
            open(new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE));
            call.reject("بلوتوث خاموشه. روشنش کن و دوباره بزن.", "BT_OFF");
            return false;
        }
        return true;
    }

    // ---------- اجازه‌ها (همون اول اپ صدا زده می‌شه) ----------
    @PluginMethod
    public void requestAccess(PluginCall call) {
        if (ensurePermissions(call, "accessAfterPermission")) call.resolve();
    }

    @PermissionCallback
    private void accessAfterPermission(PluginCall call) {
        if (hasAccess()) call.resolve();
        else call.reject("Permission denied");
    }

    @PluginMethod
    public void openAppSettings(PluginCall call) {
        open(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getContext().getPackageName())));
        call.resolve();
    }

    // ---------- میزبان ----------
    @PluginMethod
    public void startHosting(PluginCall call) {
        if (ensurePermissions(call, "hostAfterPermission")) doHost(call);
    }

    @PermissionCallback
    private void hostAfterPermission(PluginCall call) {
        if (hasAccess()) doHost(call);
        else call.reject("Permission denied");
    }

    private void doHost(PluginCall call) {
        if (!radiosReady(call)) return;
        AdvertisingOptions options = new AdvertisingOptions.Builder().setStrategy(STRATEGY).build();
        client().startAdvertising(call.getString("name", "میز"), SERVICE_ID, lifecycle, options)
            .addOnSuccessListener(v -> call.resolve())
            .addOnFailureListener(e -> call.reject(e.getMessage()));
    }

    // ---------- مهمان ----------
    @PluginMethod
    public void startDiscovery(PluginCall call) {
        if (ensurePermissions(call, "discoverAfterPermission")) doDiscover(call);
    }

    @PermissionCallback
    private void discoverAfterPermission(PluginCall call) {
        if (hasAccess()) doDiscover(call);
        else call.reject("Permission denied");
    }

    private void doDiscover(PluginCall call) {
        if (!radiosReady(call)) return;
        DiscoveryOptions options = new DiscoveryOptions.Builder().setStrategy(STRATEGY).build();
        client().startDiscovery(SERVICE_ID, discovery, options)
            .addOnSuccessListener(v -> call.resolve())
            .addOnFailureListener(e -> call.reject(e.getMessage()));
    }

    @PluginMethod
    public void stopDiscovery(PluginCall call) {
        client().stopDiscovery();
        call.resolve();
    }

    @PluginMethod
    public void connect(PluginCall call) {
        String endpointId = call.getString("endpointId");
        if (endpointId == null) { call.reject("endpointId required"); return; }
        client().requestConnection(call.getString("name", "مهمان"), endpointId, lifecycle)
            .addOnSuccessListener(v -> call.resolve())
            .addOnFailureListener(e -> call.reject(e.getMessage()));
    }

    // ---------- پیام ----------
    @PluginMethod
    public void send(PluginCall call) {
        String data = call.getString("data", "");
        String endpointId = call.getString("endpointId");
        Payload payload = Payload.fromBytes(data.getBytes(StandardCharsets.UTF_8));
        if (endpointId != null) {
            client().sendPayload(endpointId, payload);
        } else if (!connected.isEmpty()) {
            client().sendPayload(new ArrayList<>(connected), payload);
        }
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        ConnectionsClient c = client();
        c.stopAdvertising();
        c.stopDiscovery();
        c.stopAllEndpoints();
        connected.clear();
        names.clear();
        call.resolve();
    }

    // ---------- callback ها ----------
    private final ConnectionLifecycleCallback lifecycle = new ConnectionLifecycleCallback() {
        @Override
        public void onConnectionInitiated(String endpointId, ConnectionInfo info) {
            names.put(endpointId, info.getEndpointName());
            client().acceptConnection(endpointId, payloads); // بازی رفیقانه‌ست؛ همه رو قبول کن
        }

        @Override
        public void onConnectionResult(String endpointId, ConnectionResolution result) {
            JSObject o = new JSObject();
            o.put("endpointId", endpointId);
            o.put("name", names.get(endpointId));
            if (result.getStatus().getStatusCode() == ConnectionsStatusCodes.STATUS_OK) {
                connected.add(endpointId);
                notifyListeners("connected", o);
            } else {
                notifyListeners("connectFailed", o);
            }
        }

        @Override
        public void onDisconnected(String endpointId) {
            connected.remove(endpointId);
            JSObject o = new JSObject();
            o.put("endpointId", endpointId);
            notifyListeners("disconnected", o);
        }
    };

    private final PayloadCallback payloads = new PayloadCallback() {
        @Override
        public void onPayloadReceived(String endpointId, Payload payload) {
            if (payload.getType() != Payload.Type.BYTES || payload.asBytes() == null) return;
            JSObject o = new JSObject();
            o.put("endpointId", endpointId);
            o.put("data", new String(payload.asBytes(), StandardCharsets.UTF_8));
            notifyListeners("message", o);
        }

        @Override
        public void onPayloadTransferUpdate(String endpointId, PayloadTransferUpdate update) { }
    };

    private final EndpointDiscoveryCallback discovery = new EndpointDiscoveryCallback() {
        @Override
        public void onEndpointFound(String endpointId, DiscoveredEndpointInfo info) {
            JSObject o = new JSObject();
            o.put("endpointId", endpointId);
            o.put("name", info.getEndpointName());
            notifyListeners("endpointFound", o);
        }

        @Override
        public void onEndpointLost(String endpointId) {
            JSObject o = new JSObject();
            o.put("endpointId", endpointId);
            notifyListeners("endpointLost", o);
        }
    };
}
