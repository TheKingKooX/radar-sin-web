package pe.radarsinweb.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

// La app es la misma página web (index.html y las demos), empaquetada en assets/www y mostrada en un WebView.
// Los enlaces externos (WhatsApp, Maps, Instagram, la web) se abren en sus propias apps.
public class MainActivity extends Activity {
    private static final String INICIO = "file:///android_asset/www/index.html";
    private WebView web;

    @Override
    protected void onCreate(Bundle estado) {
        super.onCreate(estado);
        web = new WebView(this);
        setContentView(web);

        // Android 15 dibuja de borde a borde: se deja aire para la barra de estado y la de navegación.
        web.setOnApplyWindowInsetsListener((v, insets) -> {
            android.graphics.Insets b = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
            v.setPadding(b.left, b.top, b.right, b.bottom);
            return WindowInsets.CONSUMED;
        });

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // localStorage: notas, ruta, filtros
        s.setAllowFileAccess(true);            // páginas en file:///android_asset
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportMultipleWindows(false);    // target="_blank" se abre en la misma vista
        s.setTextZoom(100);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
                Uri u = req.getUrl();
                if ("file".equals(u.getScheme())) return false;
                abrirFuera(u);
                return true;
            }
        });

        if (estado != null) web.restoreState(estado);
        else web.loadUrl(INICIO);
    }

    private void abrirFuera(Uri u) {
        try {
            if ("intent".equals(u.getScheme())) {
                startActivity(Intent.parseUri(u.toString(), Intent.URI_INTENT_SCHEME));
            } else {
                startActivity(new Intent(Intent.ACTION_VIEW, u));
            }
        } catch (ActivityNotFoundException | java.net.URISyntaxException e) {
            // Sin app que lo abra: no se hace nada.
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle estado) {
        super.onSaveInstanceState(estado);
        web.saveState(estado);
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
}
