package com.smartlibrary.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CoverImageResolver {

    private static final Logger log = LoggerFactory.getLogger(CoverImageResolver.class);

    private static final Pattern IMAGE_EXT =
            Pattern.compile("\\.(jpg|jpeg|png|webp|gif|svg)(\\?.*)?$", Pattern.CASE_INSENSITIVE);

    private static final Pattern OG_CONTENT_FIRST = Pattern.compile(
            "<meta[^>]+(?:property|name)\\s*=\\s*[\"'](?:og:image|twitter:image)[\"'][^>]*content\\s*=\\s*[\"']([^\"']+)[\"']",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL);

    private static final Pattern CONTENT_FIRST = Pattern.compile(
            "<meta[^>]+content\\s*=\\s*[\"']([^\"']+)[\"'][^>]*(?:property|name)\\s*=\\s*[\"'](?:og:image|twitter:image)[\"']",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL);

    public String resolve(String raw) {
        if (raw == null || raw.isBlank()) {
            return raw;
        }
        String url = raw.trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return url;
        }
        if (IMAGE_EXT.matcher(url).find()) {
            return upgradeToHttps(url);
        }
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setInstanceFollowRedirects(true);
            conn.setConnectTimeout(4000);
            conn.setReadTimeout(4000);
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (compatible; SmartLibraryAssistant/1.0)");
            int status = conn.getResponseCode();
            if (status < 200 || status >= 300) {
                conn.disconnect();
                return url;
            }
            String contentType = conn.getContentType() == null ? "" : conn.getContentType().toLowerCase();
            if (contentType.startsWith("image/")) {
                conn.disconnect();
                return upgradeToHttps(url);
            }
            String body;
            try (InputStream in = conn.getInputStream()) {
                byte[] buffer = new byte[131072];
                int read = in.readNBytes(buffer, 0, buffer.length);
                body = new String(buffer, 0, read, StandardCharsets.UTF_8);
            }
            conn.disconnect();

            String image = firstMatch(OG_CONTENT_FIRST, body);
            if (image == null) {
                image = firstMatch(CONTENT_FIRST, body);
            }
            if (image == null) {
                return url;
            }
            image = image.trim().replace("&amp;", "&");
            if (image.startsWith("//")) {
                return "https:" + image;
            }
            if (image.startsWith("http://") || image.startsWith("https://")) {
                return upgradeToHttps(image);
            }
            return upgradeToHttps(new URL(new URL(url), image).toString());
        } catch (Exception e) {
            log.debug("Cover image resolution skipped for {}: {}", url, e.getMessage());
            return url;
        }
    }

    private static String firstMatch(Pattern pattern, String body) {
        Matcher matcher = pattern.matcher(body);
        return matcher.find() ? matcher.group(1) : null;
    }

    private static String upgradeToHttps(String url) {
        return url.startsWith("http://") ? "https://" + url.substring(7) : url;
    }
}
